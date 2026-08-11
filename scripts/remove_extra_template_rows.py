from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = {
    ROOT / "invoice" / "revoinvoiceservice.docx": (1, 2),
    ROOT / "costestimation" / "costestimation.docx": (0, 1),
}


def remove_blank_row_after_item_template(table) -> bool:
    if len(table.rows) <= 2:
        return False

    extra_row = table.rows[2]
    if any(cell.text.strip() for cell in extra_row.cells):
        return False

    table._tbl.remove(extra_row._tr)
    return True


def main() -> None:
    for template_path, table_indexes in TEMPLATES.items():
        document = Document(template_path)
        removed_rows = 0

        for table_index in table_indexes:
            removed_rows += int(
                remove_blank_row_after_item_template(document.tables[table_index])
            )

        if removed_rows:
            document.save(template_path)

        print(f"{template_path}: removed {removed_rows} extra row(s)")


if __name__ == "__main__":
    main()
