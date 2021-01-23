from bs4 import BeautifulSoup

if __name__ == "__main__":
    with open ("dist/index.html", "r+") as fp:
        parser = BeautifulSoup(fp, "html.parser")

        script_tags = parser.select("script")
        for tag in script_tags:
            if tag.attrs.get("type") == "module":
                tag.extract()
            else:
                del(tag["nomodule"])

        fp.seek(0)
        fp.write(parser.prettify("utf-8").decode("utf-8"))
        fp.truncate()
