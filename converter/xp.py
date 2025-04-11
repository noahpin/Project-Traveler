import pandas as pd

import lxml.etree as ET
def parse_xml(file_path):
    """
    Parses an XML file and prints the tag and text of each element.

    Args:
        file_path (str): The path to the XML file.
    """
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
        data = []
        for element in root.iter("category"):
            slug = element.findtext("category_nicename")
            description = element.findtext("category_description")
            name = element.findtext("cat_name")
            parent = element.findtext("category_parent")
            data.append({"slug": slug, "description": description, "name": name, "parent": parent})

        df = pd.DataFrame(data, columns=["slug", "description", "name", "parent"])
        print(df)
        output_file = "output.csv"  # Specify the output file name
        df.to_csv(output_file, index=False)
        print(f"Data saved to {output_file}")

        # for element in root.iter("category"):
        #     print(f"Tag: {element.tag}, term_id: {ET.tostring(element, encoding='unicode')}")
        #     # category_nicename -> slug
        #     # category_description -> description
        #     # cat_name -> name
        #     # category_parent -> parent


    except FileNotFoundError:
        print(f"Error: File not found: {file_path}")
    except ET.ParseError:
        print(f"Error: Failed to parse XML file: {file_path}")

if __name__ == "__main__":
    file_path = "./x.xml"  # Replace with your XML file path

    parse_xml(file_path)