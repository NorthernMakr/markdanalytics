"""Builds the SDR workbooks from src/data/sdr.json (the same data the website's
Implementation pages render), one per language:
  public/downloads/markdanalytics-sdr-en.xlsx
  public/downloads/markdanalytics-sdr-fr.xlsx
Run after editing sdr.json:  python3 scripts/build-sdr-xlsx.py
Then recalculate the summary formulas (see README)."""
import json, pathlib
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.formatting.rule import CellIsRule

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "src/data/sdr.json").read_text())

L = {
  "en": dict(about="About", req="Requirements", sdr="SDR", dev="Developers", biz="Business users",
    title="Solution design reference: markdanalytics.ca demo store and news site",
    intro="Illustrative SDR for fictional demo sites (Taiga Supply Co., Balsam Daily). Every value sent to analytics is English, whatever the page language.",
    version="Version", updated="Updated", owner="Owner", source="Source",
    source_v="src/data/sdr.json in the site's repository; the website renders the same data.",
    legend="How to use this workbook",
    legend_rows=[("Requirements", "Business questions, the decision each informs, and the variables that answer it."),
                 ("SDR", "Every variable: Adobe slot, data layer source, expiry and allocation, GA4 equivalent, status."),
                 ("Developers", "What the page must expose, with a one-line reason."),
                 ("Business users", "What each variable means, what to pair it with, and why it's an eVar or a prop."),
                 ("Status", "Live = collected and checked in the browser; Proposed = designed, not built.")],
    summary="Summary", live="Live", proposed="Proposed", total="Variables",
    h_req=["ID","Question","Decision it informs","KPIs","Site","Priority","Owner","Answered by"],
    h_sdr=["Variable","Name","Requirements","Data layer source","Example","Expiry","Allocation","Set on","GA4","GA4 scope","Status"],
    h_dev=["Expose in the data layer","Why (brief)","Example","Send on","Status"],
    h_biz=["Name","What it means","Pair it with","Why this kind of variable","Adobe","GA4","Status"],
    site={"both":"Both","store":"Store","media":"Media"}, prio={"High":"High","Medium":"Medium"}, all="All variables"),
  "fr": dict(about="À propos", req="Besoins", sdr="SDR", dev="Développeurs", biz="Utilisateurs d’affaires",
    title="Référence de conception de la solution : boutique et site de nouvelles démo de markdanalytics.ca",
    intro="SDR illustrative pour des sites démo fictifs (Taiga Supply Co., Balsam Daily). Chaque valeur envoyée à l’analytique est en anglais, quelle que soit la langue de la page.",
    version="Version", updated="Mise à jour", owner="Responsable", source="Source",
    source_v="src/data/sdr.json dans le dépôt du site; le site web affiche les mêmes données.",
    legend="Comment utiliser ce classeur",
    legend_rows=[("Besoins", "Questions d’affaires, décision éclairée et variables qui y répondent."),
                 ("SDR", "Chaque variable : emplacement Adobe, source dans la couche de données, expiration et attribution, équivalent GA4, statut."),
                 ("Développeurs", "Ce que la page doit exposer, avec une raison en une ligne."),
                 ("Utilisateurs d’affaires", "Ce que signifie chaque variable, à quoi l’associer, et pourquoi c’est une eVar ou une prop."),
                 ("Statut", "En production = recueillie et vérifiée dans le navigateur; Proposé = conçue, pas construite.")],
    summary="Résumé", live="En production", proposed="Proposé", total="Variables",
    h_req=["ID","Question","Décision éclairée","Indicateurs","Site","Priorité","Responsable","Variables"],
    h_sdr=["Variable","Nom","Besoins","Source (couche de données)","Exemple","Expiration","Attribution","Fixée sur","GA4","Portée GA4","Statut"],
    h_dev=["À exposer dans la couche de données","Pourquoi (en bref)","Exemple","Envoyer sur","Statut"],
    h_biz=["Nom","Ce que ça signifie","À associer à","Pourquoi ce type de variable","Adobe","GA4","Statut"],
    site={"both":"Les deux","store":"Boutique","media":"Médias"}, prio={"High":"Haute","Medium":"Moyenne"}, all="Toutes les variables"),
}

FONT = "Arial"
NAVY = "14213D"
head_font = Font(name=FONT, bold=True, color="FFFFFF", size=10)
head_fill = PatternFill("solid", start_color=NAVY)
body_font = Font(name=FONT, size=10)
thin = Side(style="thin", color="D5DAE1")
border = Border(left=thin, right=thin, top=thin, bottom=thin)
wrap = Alignment(wrap_text=True, vertical="top")

def table(ws, headers, rows, widths, status_col=None, lang="en"):
    ws.append(headers)
    for c in ws[1]:
        c.font, c.fill, c.alignment, c.border = head_font, head_fill, Alignment(wrap_text=True, vertical="center"), border
    for r in rows:
        ws.append(r)
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.font, c.alignment, c.border = body_font, wrap, border
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{len(rows)+1}"
    if status_col:
        col = get_column_letter(status_col)
        rng = f"{col}2:{col}{len(rows)+1}"
        live, prop = L[lang]["live"], L[lang]["proposed"]
        ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=[f'"{live}"'], fill=PatternFill("solid", start_color="DDEFE3")))
        ws.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=[f'"{prop}"'], fill=PatternFill("solid", start_color="FBEBC8")))

def build(lang):
    t = L[lang]
    tx = lambda o: o[lang]
    st = lambda s: t["live"] if s == "live" else t["proposed"]
    req = {r["id"]: r for r in data["requirements"]}
    wb = Workbook()

    # About sheet
    ws = wb.active
    ws.title = t["about"]
    ws["A1"] = t["title"]; ws["A1"].font = Font(name=FONT, bold=True, size=14, color=NAVY)
    ws["A2"] = t["intro"]; ws["A2"].font = body_font; ws["A2"].alignment = wrap
    ws.merge_cells("A2:D2"); ws.row_dimensions[2].height = 30
    for i, (k, v) in enumerate([(t["version"], data["version"]), (t["updated"], data["updated"]),
                                (t["owner"], "Mark Dykeman"), (t["source"], t["source_v"])], start=4):
        ws.cell(i, 1, k).font = Font(name=FONT, bold=True, size=10)
        ws.cell(i, 2, v).font = body_font
    ws["A9"] = t["legend"]; ws["A9"].font = Font(name=FONT, bold=True, size=12, color=NAVY)
    for i, (k, v) in enumerate(t["legend_rows"], start=10):
        ws.cell(i, 1, k).font = Font(name=FONT, bold=True, size=10)
        c = ws.cell(i, 2, v); c.font = body_font; c.alignment = wrap
        ws.merge_cells(start_row=i, start_column=2, end_row=i, end_column=4)
    ws["A16"] = t["summary"]; ws["A16"].font = Font(name=FONT, bold=True, size=12, color=NAVY)
    n = len(data["variables"]) + 1
    sdr_sheet = f"'{t['sdr']}'"
    for i, (label, formula) in enumerate([
        (t["total"], f"=COUNTA({sdr_sheet}!A2:A{n})"),
        (t["live"], f'=COUNTIF({sdr_sheet}!K2:K{n},"{t["live"]}")'),
        (t["proposed"], f'=COUNTIF({sdr_sheet}!K2:K{n},"{t["proposed"]}")'),
    ], start=17):
        ws.cell(i, 1, label).font = Font(name=FONT, bold=True, size=10)
        ws.cell(i, 2, formula).font = body_font
    ws.column_dimensions["A"].width = 24
    for col in "BCD":
        ws.column_dimensions[col].width = 40

    # Requirements
    ws = wb.create_sheet(t["req"])
    rows = []
    for r in data["requirements"]:
        vars_ = ", ".join(v["adobe"] for v in data["variables"] if r["id"] in v["reqs"]) or t["all"]
        rows.append([r["id"], tx(r["question"]), tx(r["decision"]), tx(r["kpis"]), t["site"][r["site"]], t["prio"][r["priority"]], tx(r["owner"]), vars_])
    table(ws, t["h_req"], rows, [9, 48, 34, 40, 11, 10, 22, 30])

    # SDR
    ws = wb.create_sheet(t["sdr"])
    rows = [[v["adobe"], tx(v["name"]), ", ".join(v["reqs"]), v["dl"], v["example"], v["expiry"], v["allocation"],
             tx(v["setOn"]), v["ga4"]["name"], v["ga4"]["scope"], st(v["status"])] for v in data["variables"]]
    table(ws, t["h_sdr"], rows, [22, 26, 13, 34, 28, 11, 13, 26, 30, 10, 14], status_col=11, lang=lang)

    # Developers
    ws = wb.create_sheet(t["dev"])
    rows = [[v["dl"], tx(req[v["reqs"][0]]["question"]), v["example"], tx(v["setOn"]), st(v["status"])]
            for v in data["variables"] if v["type"] != "prop"]
    table(ws, t["h_dev"], rows, [36, 52, 30, 30, 14], status_col=5, lang=lang)

    # Business users
    ws = wb.create_sheet(t["biz"])
    rows = [[tx(v["name"]), tx(v["meaning"]), tx(v["metrics"]), tx(v["why"]), v["adobe"], v["ga4"]["name"], st(v["status"])]
            for v in data["variables"]]
    table(ws, t["h_biz"], rows, [26, 44, 34, 44, 22, 30, 14], status_col=7, lang=lang)

    out = ROOT / f"public/downloads/markdanalytics-sdr-{lang}.xlsx"
    wb.save(out)
    print("wrote", out.relative_to(ROOT))

for lang in ("en", "fr"):
    build(lang)
