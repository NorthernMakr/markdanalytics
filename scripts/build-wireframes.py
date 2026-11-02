"""Draws the numbered product-page wireframe used by the sample specification,
in English and French:  python3 scripts/build-wireframes.py
Output: public/images/specs/pdp-wireframe-{en,fr}.svg
Numbers match the "Tracked elements" table in
src/content/pages/implementation/product-page-specification.mdx."""
import pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "public/images/specs"

T = {
  "en": dict(logo="Taiga Supply Co.", nav=["Shop all", "Packs & bags", "Apparel", "Camp"], cart="Cart (0)", lang="EN | FR",
             crumb="Shop all / Packs & bags", title="Tidepool daypack", price="$129.00", blurb="Short description",
             colour="Colour", qty="Qty 1 ▾", add="Add to cart", wish="Save to wishlist", details="Product details (4 bullets)",
             related="You might also like", footer="Footer links", image="Product image"),
  "fr": dict(logo="Taiga Supply Co.", nav=["Tout voir", "Sacs", "Vêtements", "Camping"], cart="Panier (0)", lang="EN | FR",
             crumb="Tout voir / Sacs", title="Sac de jour Tidepool", price="129,00 $", blurb="Courte description",
             colour="Couleur", qty="Qté 1 ▾", add="Ajouter au panier", wish="Ajouter aux favoris", details="Détails du produit (4 puces)",
             related="Vous aimerez peut-être aussi", footer="Liens du pied de page", image="Image du produit"),
}

def svg(t):
    g = []
    box = lambda x, y, w, h, fill="#E9ECF0", r=6, stroke="#B9C0CA": g.append(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')
    text = lambda x, y, s, size=15, weight=400, fill="#4A5363", anchor="start": g.append(
        f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>')
    def mark(n, x, y):
        x, y = x - 12, y - 6  # sit just above-left of the element
        g.append(f'<circle cx="{x}" cy="{y}" r="15" fill="#F5C445" stroke="#14213D" stroke-width="2"/>')
        text(x, y + 5, str(n), 14, 700, "#14213D", "middle")
    # page frame
    box(0, 0, 1200, 1060, "#FFFFFF", 10, "#9AA3AF")
    # header bar
    box(20, 20, 1160, 56, "#DDE2E8", 6)
    text(44, 54, t["logo"], 17, 700, "#2B3340"); mark(1, 36, 30)
    x = 300
    for item in t["nav"]:
        text(x, 54, item, 15); x += len(item) * 9 + 40
    mark(2, 290, 30)
    text(1000, 54, t["cart"], 15, 600); mark(3, 992, 30)
    text(1100, 54, t["lang"], 14, 600); mark(4, 1092, 30)
    # image
    box(40, 110, 520, 520); text(300, 375, t["image"], 16, 400, "#7B8494", "middle")
    # buy box
    text(620, 130, t["crumb"], 14); mark(5, 610, 112)
    box(620, 150, 380, 34, "#CDD3DB", 4, "#CDD3DB"); text(632, 174, t["title"], 18, 700, "#2B3340")
    box(620, 196, 110, 22, "#CDD3DB", 4, "#CDD3DB"); text(628, 213, t["price"], 14, 600, "#2B3340")
    box(620, 232, 420, 16, "#E4E8ED", 4, "#E4E8ED")
    text(620, 290, t["colour"], 14, 600)
    for i, c in enumerate(["#B9C0CA", "#CDD3DB", "#E4E8ED"]):
        g.append(f'<circle cx="{640 + i*46}" cy="{320}" r="17" fill="{c}" stroke="#8E97A5" stroke-width="1.5"/>')
    mark(6, 610, 296)
    box(620, 365, 96, 44); text(634, 393, t["qty"], 14); mark(7, 616, 357)
    box(730, 365, 170, 44, "#C9CED6", 22); text(815, 393, t["add"], 14, 700, "#2B3340", "middle"); mark(8, 728, 357)
    box(915, 365, 190, 44, "#FFFFFF", 22, "#4A5363"); text(1010, 393, t["wish"], 14, 600, "#2B3340", "middle"); mark(9, 913, 357)
    box(620, 430, 300, 90, "#F2F4F7", 4, "#E0E4EA"); text(634, 480, t["details"], 13, 400, "#7B8494")
    # related products
    text(40, 690, t["related"], 20, 700, "#2B3340")
    for i in range(4):
        x = 40 + i * 285
        box(x, 715, 265, 210); box(x, 935, 170, 18, "#CDD3DB", 4, "#CDD3DB"); box(x, 962, 70, 14, "#E4E8ED", 4, "#E4E8ED")
    mark(10, 36, 712)
    # footer
    box(20, 1000, 1160, 40, "#F2F4F7", 6, "#E0E4EA"); text(44, 1026, t["footer"], 14); mark(11, 36, 998)
    body = "\n  ".join(g)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 1240 1100" role="img" '
            f'font-family="Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif">\n  {body}\n</svg>\n')

for lang, t in T.items():
    (OUT / f"pdp-wireframe-{lang}.svg").write_text(svg(t).replace("&", "&amp;").replace("&amp;amp;", "&amp;"))
    print("wrote", f"pdp-wireframe-{lang}.svg")
