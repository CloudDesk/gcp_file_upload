from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile
import re


TEMPLATE = Path(__file__).resolve().parents[1] / "invoice" / "revoinvoicerental.docx"
REPLACEMENTS = {
    "{customername}": "{shippingcustomername}",
    "{customeraddress}": "{shippingcustomeraddress}",
    "{customerphonenumber}": "{shippingcustomerphonenumber}",
    "{customergstnumber}": "{shippingcustomergstnumber}",
}


def patch_document_xml(xml_bytes: bytes) -> bytes:
    # Patch raw OOXML instead of parsing and serializing it. Docxtemplater
    # recognizes Word's literal `w:` namespace prefix, so changing it to an
    # automatically generated prefix (for example `ns0:`) breaks all fields.
    xml = xml_bytes.decode("utf-8")
    shipping_start = xml.find("SHIPPING TO")
    shipping_end = xml.find("PRODUCT INVOICE", shipping_start)
    if shipping_start < 0 or shipping_end < 0:
        raise RuntimeError("Rental invoice shipping section was not found")

    before = xml[:shipping_start]
    shipping_section = xml[shipping_start:shipping_end]
    after = xml[shipping_end:]

    for old_value, new_value in REPLACEMENTS.items():
        # Word can split a placeholder across multiple styled runs. Permit XML
        # tags between token characters and collapse only that token to one run.
        pattern = "(?:<[^>]+>)*".join(re.escape(char) for char in old_value)
        shipping_section, count = re.subn(pattern, new_value, shipping_section, count=1)
        if count != 1:
            raise RuntimeError(f"Shipping placeholder not found: {old_value}")

    return (before + shipping_section + after).encode("utf-8")


def main() -> None:
    with ZipFile(TEMPLATE, "r") as source:
        entries = [(item, source.read(item.filename)) for item in source.infolist()]

    with NamedTemporaryFile(delete=False, suffix=".docx", dir=TEMPLATE.parent) as handle:
        temporary_path = Path(handle.name)

    try:
        with ZipFile(temporary_path, "w", ZIP_DEFLATED) as target:
            for item, content in entries:
                if item.filename == "word/document.xml":
                    content = patch_document_xml(content)
                target.writestr(item, content)
        temporary_path.replace(TEMPLATE)
    finally:
        temporary_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
