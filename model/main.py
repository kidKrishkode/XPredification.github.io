# import require python libs
import sys
import json

# import require python files
import propert_price

def main():
    if len(sys.argv) <= 1:
        print("Error: Usage: main.py <list-data> <function-value>")
        return
    
    asset = []
    for i in range(0,len(sys.argv)-2):
        asset.append(sys.argv[i+1] * 1)
    function_name = sys.argv[len(sys.argv)-1]

    if function_name == 'property Price':
        price = propert_price.property_report(asset)
        result = {
            "value": price,
            "statement": len(sys.argv)
        }
        print(json.dumps(result))
    else:
        print(f"Function {function_name} is not recognized")

if __name__ == "__main__":
    main()
    
