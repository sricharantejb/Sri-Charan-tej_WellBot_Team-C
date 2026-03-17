with open(r'c:\Users\Sai shashank\Downloads\wellbot\backend\error.log', 'r', encoding='utf-16le') as f:
    lines = f.readlines()
    for line in lines[-50:]:
        print(line.strip())
