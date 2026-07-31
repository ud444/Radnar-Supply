import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { Icon } from "@/components/admin/icons";
import {
  PageHeader, ButtonLink, TableWrap, Table, THead, Th, Tr, Td, Badge, EmptyState, Ident,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function BlogAdmin() {
  await requireAdmin();
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Blog"
        actions={<ButtonLink href="/admin/blog/new"><Icon.plus /> New post</ButtonLink>}
      />

      <TableWrap>
        <Table>
          <THead>
            <tr><Th>Title</Th><Th>Slug</Th><Th>Status</Th><Th>Updated</Th></tr>
          </THead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <Td colSpan={4}>
                  <EmptyState
                    title="No posts yet"
                    hint="The journal is good for SEO — write a first article about sourcing or a brand."
                    action={<ButtonLink href="/admin/blog/new"><Icon.plus /> New post</ButtonLink>}
                  />
                </Td>
              </tr>
            ) : posts.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-accent transition-colors">
                    {p.title}
                  </Link>
                </Td>
                <Td><Ident>/{p.slug}</Ident></Td>
                <Td>
                  <Badge tone={p.published ? "success" : "neutral"}>
                    {p.published ? "Published" : "Draft"}
                  </Badge>
                </Td>
                <Td className="text-muted whitespace-nowrap">{p.updatedAt.toLocaleDateString("en-GB")}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
