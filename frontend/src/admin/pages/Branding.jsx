import { useState } from "react";
import { admin, formWith } from "../../lib/api";
import { useCanEdit } from "../auth";
import { useAsync } from "../hooks";
import { Card, ConfirmDialog, ErrorBanner, Field, Loading, Notice, PageHeader, errorText, useToast } from "../ui";

export default function Branding() {
  const canEdit = useCanEdit();
  const toast = useToast();
  const { data, error, loading, reload } = useAsync(async () => {
    const [branding, settings] = await Promise.all([admin.get("/admin/branding/"), admin.get("/admin/site-settings/")]);
    return { branding, settings };
  }, []);
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState(null);
  const [confirm, setConfirm] = useState(false);

  if (loading) return <Loading />;
  if (error) return <ErrorBanner error={{ message: errorText(error) }} />;
  const { branding, settings } = data;
  const current = names || { brand_name: settings.brand_name, logo_alt: settings.logo_alt };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const result = await admin.upload("POST", "/admin/branding/logo/", formWith({ file }));
      toast(result.square ? "Logo replaced." : "Logo replaced. It is not square, so it is shown at its own proportions without stretching.");
      await reload();
    } catch (err) {
      toast(errorText(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const saveNames = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await admin.patch("/admin/site-settings/", current);
      setNames(null);
      toast("Branding names saved.");
      await reload();
    } catch (err) {
      toast(errorText(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const removeLogo = async () => {
    setConfirm(false);
    try {
      await admin.del("/admin/branding/logo/");
      toast("Logo removed. The website uses its built-in logo.");
      await reload();
    } catch (err) {
      toast(errorText(err), "error");
    }
  };

  return (
    <>
      <PageHeader title="Branding" description="The logo appears in the navbar and full-screen preloader, preserving its original proportions." />
      <Notice tone="info">
        The official clinic logo has a transparent background. PNG uploads preserve that transparency.
      </Notice>
      <div className="adm-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", alignItems: "start" }}>
        <Card title="Current logo">
          <div className="adm-preview" style={{ padding: "2rem", background: "#24130c" }}>
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={settings.logo_alt} style={{ width: 220, height: "auto", maxWidth: "100%", objectFit: "contain" }} />
            ) : (
              <img src="/images/ajitha-dental-clinic-logo.png" alt={settings.logo_alt}
                style={{ width: 220, height: "auto", maxWidth: "100%", objectFit: "contain" }} />
            )}
          </div>
          <dl className="adm-kv" style={{ marginTop: "1rem" }}>
            <dt>File size limit</dt><dd>{branding.max_logo_mb} MB</dd>
            <dt>Accepted formats</dt><dd>{branding.accepted_formats.join(", ")} (SVG is not accepted, for security)</dd>
            <dt>Dimensions</dt><dd>{branding.logo_width ? `${branding.logo_width} × ${branding.logo_height} px` : "Unknown"}</dd>
          </dl>
          {canEdit && (
            <div className="adm-actions" style={{ marginTop: "1rem" }}>
              <label className="adm-btn adm-btn-gold adm-btn-file">{busy ? "Uploading…" : "Replace logo"}
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload} />
              </label>
              {branding.logo_url && <button type="button" className="adm-btn adm-btn-ghost" onClick={() => setConfirm(true)}>Remove logo</button>}
            </div>
          )}
        </Card>

        <Card title="Brand names">
          <form onSubmit={saveNames} className="adm-form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Field label="Brand name" id="brand-name" hint="Used in the preloader and in alternative text.">
              <input id="brand-name" type="text" value={current.brand_name} disabled={!canEdit}
                onChange={(e) => setNames({ ...current, brand_name: e.target.value })} />
            </Field>
            <Field label="Logo alternative text" id="logo-alt" hint="Describes the logo for screen readers.">
              <input id="logo-alt" type="text" value={current.logo_alt} disabled={!canEdit}
                onChange={(e) => setNames({ ...current, logo_alt: e.target.value })} />
            </Field>
            {canEdit && <div><button type="submit" className="adm-btn adm-btn-gold" disabled={busy || !names}>Save names</button></div>}
          </form>
        </Card>
      </div>
      <ConfirmDialog open={confirm} title="Remove the logo?" message="The website will fall back to the official clinic logo."
        confirmLabel="Remove logo" onConfirm={removeLogo} onCancel={() => setConfirm(false)} />
    </>
  );
}
