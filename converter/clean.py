def main():
    try: 
        with open("xp.xml", "r")as file:
            content = file.read()
    except FileNotFoundError:
        print('ok')
    mod = content.replace("wp:", "")

    with open("xp-clean.xml", "w") as file:
        file.write(mod)

if __name__ == "__main__":
    main()