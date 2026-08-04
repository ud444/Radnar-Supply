import { requireAdmin } from "@/lib/auth";
import { emailConfig } from "@/lib/email";
import { EMAIL_GROUPS, AUDIENCE_LABEL } from "@/lib/emailCatalogue";
import { sendTest } from "./actions";
import {
  PageHeader, ButtonLink, Button, Card, SectionTitle, TableWrap, Table, THead,
  Th, Tr, Td, Badge, Notice, Eyebrow, Ident,
} from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

type SP = { sent?: string; error?: string };

export default async function EmailsAdmin({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const cfg = emailConfig();

  return (
    <div>
      <PageHeader
        eyebrow="Communications"
        title="Emails"
        description="Every message the store sends, and what makes it send. Test any of them without touching live data."
        actions={
          <ButtonLink href="/admin/emails/new">
            <Icon.plus /> New email
          </ButtonLink>
        }
      />

      {sp.sent ? <Notice tone="success">Test sent to {sp.sent}. If it does not arrive, check the spam folder and the sending domain below.</Notice> : null}
      {sp.error ? <Notice tone="danger">{sp.error}</Notice> : null}

      {/* Delivery status — the first thing to check when mail goes missing. */}
      <section className="mb-8">
        <SectionTitle>Delivery</SectionTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <Eyebrow>Status</Eyebrow>
            <div className="mt-2">
              {cfg.configured
                ? <Badge tone="success">Connected</Badge>
                : <Badge tone="danger">Not configured</Badge>}
            </div>
            {!cfg.configured ? (
              <p className="text-[12px] text-muted mt-2">
                Set <code className="font-mono">RESEND_API_KEY</code> to enable sending.
              </p>
            ) : null}
          </Card>

          <Card>
            <Eyebrow>Sending as</Eyebrow>
            <div className="mt-2 text-[13px] break-all">{cfg.from}</div>
            {cfg.usingTestDomain ? (
              <p className="text-[12px] text-warning mt-2">
                resend.dev only delivers to your own Resend account address. Verify a real domain
                before going live.
              </p>
            ) : (
              <p className="text-[12px] text-muted mt-2">
                <Ident>{cfg.domain}</Ident> must be verified in Resend or every send is rejected.
              </p>
            )}
          </Card>

          <Card>
            <Eyebrow>Replies go to</Eyebrow>
            <div className="mt-2 text-[13px] break-all">{cfg.replyTo ?? cfg.address}</div>
            <p className="text-[12px] text-muted mt-2">
              {cfg.replyTo
                ? <>Alerts arrive at <span className="break-all">{cfg.inbox}</span>.</>
                : <>Set <code className="font-mono">EMAIL_REPLY_TO</code> to a mailbox you read — the
                   sending domain may not have one, and replies would bounce.</>}
            </p>
          </Card>

          <Card>
            <Eyebrow>Marketing audience</Eyebrow>
            <div className="mt-2">
              {cfg.audienceConfigured
                ? <Badge tone="success">Connected</Badge>
                : <Badge tone="neutral">Not set</Badge>}
            </div>
            <p className="text-[12px] text-muted mt-2">
              Needed for Broadcast. Set <code className="font-mono">RESEND_AUDIENCE_ID</code>.
            </p>
          </Card>
        </div>
      </section>

      {EMAIL_GROUPS.map((g) => (
        <section key={g.group} className="mb-8">
          <SectionTitle>{g.group}</SectionTitle>
          <p className="text-[13px] text-muted -mt-1 mb-3">{g.note}</p>
          <TableWrap>
            <Table>
              <THead>
                <tr>
                  <Th>Email</Th>
                  <Th>Sends when</Th>
                  <Th>Goes to</Th>
                  <Th align="right">Test</Th>
                </tr>
              </THead>
              <tbody>
                {g.emails.map((e) => (
                  <Tr key={e.id}>
                    <Td>
                      <div className="font-medium">{e.name}</div>
                      <Ident>{e.source}</Ident>
                    </Td>
                    <Td className="text-muted max-w-md">{e.trigger}</Td>
                    <Td>
                      <Badge tone={e.audience === "admin" ? "info" : "neutral"} dot={false}>
                        {AUDIENCE_LABEL[e.audience]}
                      </Badge>
                    </Td>
                    <Td align="right">
                      {e.testable ? (
                        <form action={sendTest} className="inline-flex items-center gap-1.5 justify-end">
                          <input type="hidden" name="id" value={e.id} />
                          <input
                            type="email" name="to" defaultValue={me.email} required
                            aria-label={`Send a test of ${e.name} to`}
                            className="h-8 w-[190px] rounded-control border border-line bg-paper px-2.5 text-[12px] text-ink focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/25"
                          />
                          <Button variant="secondary" size="sm" disabled={!cfg.configured}>Send</Button>
                        </form>
                      ) : (
                        <ButtonLink href="/admin/broadcast" variant="ghost" size="sm">Compose →</ButtonLink>
                      )}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </section>
      ))}

      <Card>
        <Eyebrow>If nothing arrives</Eyebrow>
        <ol className="mt-2.5 space-y-1.5 text-[13px] text-muted list-decimal pl-4">
          <li>Confirm the status above reads Connected.</li>
          <li>
            Verify the sending domain in Resend. An unverified domain is the most common cause —
            Resend rejects the send and, until now, that rejection was being swallowed silently.
          </li>
          <li>Send a test to yourself from any row above; the error is shown in full if it fails.</li>
          <li>Check spam, then Resend&apos;s own delivery log for bounces.</li>
        </ol>
      </Card>
    </div>
  );
}
