import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { money } from "@/lib/format";
import { Icon } from "@/components/admin/icons";
import {
  PageHeader, ButtonLink, Toolbar, SearchInput, FilterTabs, TableWrap, Table,
  THead, Th, Tr, Td, Badge, EmptyState, Pagination, Notice, Ident,
} from "@/components/admin/ui";

type SP = { q?: string; status?: "live" | "hidden"; archived?: string; deleted?: string; page?: string };

const PER_PAGE = 20;

export default async function AdminProducts({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin();
  const sp = await searchParams;

  const where: any = {};
  if (sp.q) where.OR = [
    { name: { contains: sp.q, mode: "insensitive" } },
    { slug: { contains: sp.q, mode: "insensitive" } },
    { brand: { name: { contains: sp.q, mode: "insensitive" } } },
  ];
  if (sp.status === "live")   where.active = true;
  if (sp.status === "hidden") where.active = false;

  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const [products, total] = await Promise.all([
    db.product.findMany({
      where, orderBy: { createdAt: "desc" },
      include: { brand: true, variants: true, images: { take: 1, orderBy: { position: "asc" } } },
      take: PER_PAGE, skip: (page - 1) * PER_PAGE,
    }),
    db.product.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const pageHref = (n: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (sp.status) u.set("status", sp.status);
    if (n > 1) u.set("page", String(n));
    return `/admin/products${u.toString() ? `?${u}` : ""}`;
  };

  const qs = sp.q ? `q=${encodeURIComponent(sp.q)}` : "";
  const tabs = [
    { href: `/admin/products${qs ? `?${qs}` : ""}`, label: "All", active: !sp.status },
    { href: `/admin/products?status=live${qs ? `&${qs}` : ""}`, label: "Live", active: sp.status === "live" },
    { href: `/admin/products?status=hidden${qs ? `&${qs}` : ""}`, label: "Hidden", active: sp.status === "hidden" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        actions={
          <ButtonLink href="/admin/products/new">
            <Icon.plus /> New product
          </ButtonLink>
        }
      />

      {sp.archived ? (
        <Notice tone="warning">
          This product had order history, so it was <strong className="font-semibold">archived</strong> — hidden
          from the storefront rather than deleted, so its orders stay intact. Filter by <strong className="font-semibold">Hidden</strong> to find it.
        </Notice>
      ) : null}
      {sp.deleted ? <Notice tone="success">Product deleted.</Notice> : null}

      <Toolbar>
        <form action="/admin/products" className="flex-1 min-w-[240px]">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <SearchInput defaultValue={sp.q ?? ""} placeholder="Search by name, slug or brand…" />
        </form>
        <FilterTabs items={tabs} />
      </Toolbar>

      <TableWrap>
        <Table>
          <THead>
            <tr>
              <Th>Product</Th>
              <Th>Brand</Th>
              <Th align="right">Price</Th>
              <Th align="right">Stock</Th>
              <Th align="right">Status</Th>
            </tr>
          </THead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <Td colSpan={5}>
                  {sp.q ? (
                    <EmptyState
                      title="Nothing matches that search"
                      hint="Try a different name, slug or brand."
                    />
                  ) : (
                    <EmptyState
                      title="No products yet"
                      hint="Add your first product and it will appear on the storefront once it is live."
                      action={<ButtonLink href="/admin/products/new"><Icon.plus /> New product</ButtonLink>}
                    />
                  )}
                </Td>
              </tr>
            ) : products.map((p) => {
              const stock = p.variants.reduce((a, v) => a + v.stock, 0);
              const oos = stock === 0;
              const low = stock > 0 && stock <= 5;
              return (
                <Tr key={p.id}>
                  <Td>
                    <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url} alt="" width={40} height={48}
                          className="w-10 h-12 object-cover rounded-[6px] bg-cream shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-12 rounded-[6px] bg-cream border border-line/70 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate group-hover:text-accent transition-colors">{p.name}</div>
                        <Ident>/{p.slug}</Ident>
                      </div>
                    </Link>
                  </Td>
                  <Td className="text-muted">{p.brand.name}</Td>
                  <Td align="right" numeric className="font-medium">{money(p.priceCents)}</Td>
                  <Td align="right" numeric>
                    <span className={oos ? "text-danger font-medium" : low ? "text-warning font-medium" : ""}>
                      {stock}
                    </span>
                    {oos ? <span className="ml-1.5 text-[10px] text-danger">out</span>
                         : low ? <span className="ml-1.5 text-[10px] text-warning">low</span> : null}
                  </Td>
                  <Td align="right">
                    <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Live" : "Hidden"}</Badge>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </TableWrap>

      <Pagination page={page} pages={pages} total={total} noun="products" hrefFor={pageHref} />
    </div>
  );
}
