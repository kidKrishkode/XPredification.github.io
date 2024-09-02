import sys
import json
import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.preprocessing import StandardScaler
import Preprocessor
import ast

def accuracy():
    if './model/main.py' in sys.argv[0]:
        json_file_path = './weight/property_level.json'
    else:
        json_file_path = '../weight/property_level.json'

    with open(json_file_path) as f:
        dataset = json.load(f)

    return Preprocessor.accuracy(dataset, None, 2)

def predict_property_price(input_list):
    try:
        if './model/main.py' in sys.argv[0]:
            json_file_path = './weight/property_level.json'
            input_list = [X for X in input_list[0].split(',')]
        else:
            json_file_path = '../weight/property_level.json'
    except:
        json_file_path = './weight/property_level.json'
        input_list = [X for X in input_list[0].split(',')]

    type_, location, carpet_area, bed_room, kitchen, living_room, dining_room, toilet, balcony, parking_area, floor, window_no, entrance_no, supplience, home_loan, wall_thick = input_list

    Preprocessor.normalize(json_file_path, 'id')
    
    memory = Preprocessor.mbr([type_, location, carpet_area, bed_room, kitchen, living_room, dining_room, toilet, balcony, parking_area, floor, window_no, entrance_no, supplience, home_loan, wall_thick], json_file_path, ['price'])
    if memory != None:
        return float(memory[0])

    with open(json_file_path) as f:
        dataset = json.load(f)
    
    dataset = Preprocessor.synthesis(dataset, 'type', ['Flat','House'], [0,1])
    dataset = Preprocessor.synthesis(dataset, 'parking_area', ['public','private'], [0,1])
    dataset = Preprocessor.synthesis(dataset, 'supplience', ['No','Yes'], [0,1])
    dataset = Preprocessor.synthesis(dataset, 'home_loan', ['No','Yes'], [0,1])

    X = np.array([[data['type'], data['carpet_area'], data['bed_room'], data['kitchen'], data['living_room'], data['dining_room'], data['toilet'], data['balcony'], data['parking_area'], data['floor'], data['window_no'], data['entrance_no'], data['supplience'], data['home_loan'], data['wall_thick']] for data in dataset])
    y = np.array([target['price'] for target in dataset])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    tree_reg = DecisionTreeRegressor(random_state=42)
    tree_reg.fit(X_scaled, y)

    unknown_input = [type_, carpet_area, bed_room, kitchen, living_room, dining_room, toilet, balcony, parking_area, floor, window_no, entrance_no, supplience, home_loan, wall_thick]
    unknown_input = Preprocessor.synthesis([unknown_input], 'parking_area', ['Public','Private'], [0,1])

    unknown_input_scaled = scaler.transform(np.array(unknown_input[0]).reshape(1, -1))
    predicted_price = tree_reg.predict(unknown_input_scaled)[0]

    Preprocessor.ETL([len(dataset)+1, 'Flat' if type_==0 else 'House', location, int(carpet_area), int(bed_room), int(kitchen), int(living_room), int(dining_room), int(toilet, balcony), int(parking_area), int(floor), int(window_no), int(entrance_no), 'No' if supplience==0 else 'Yes', 'No' if home_loan==0 else 'Yes', int(wall_thick)], [int(predicted_price)], json_file_path)
    
    return predicted_price

def property_report(user_input):
    result = predict_property_price(user_input)
    return result

def main():
    if len(sys.argv) != 2:
        print("Usage: property_price.py <list-value>")
        return
    
    input_list = ast.literal_eval(sys.argv[1])
    result = property_report(input_list)
    result = {"predicted_price": result}
    print(result)

if __name__ == "__main__":
    main()
