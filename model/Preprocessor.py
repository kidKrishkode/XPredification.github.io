import sys
import json
import random
import logging
import random

assumption = random.choice([0,1])

def json_log(message):
    logging.basicConfig(filename='json_data.log',level=logging.DEBUG)
    logging.debug(json.dumps({"result": message}))

def mbr(inputs, json_file_path, output_keys):
    try:
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        for entry in data:
            if all(entry[key] == value for key, value in zip(data[0].keys(), inputs)):
                return [entry[key] for key in output_keys]
        return None
    except:
        return None

def normalize(filname, basis):
    with open(filname,'r') as f:
        database = json.load(f)
        normalize_db = sorted(database, key=lambda x: x[str(basis)])
    with open(filname, 'w') as f:
        json.dump(normalize_db, f)

def accuracy(*args):
    try:
        if len(args) == 3:
            dataset, exp, FN = args
            TP = len(dataset) or exp
            TN, FP = 0, 0
        elif len(args) == 4:
            TP, TN, FP, FN = args
        else:
            raise ValueError("Invalid number of arguments")
        accuracy = (int(TP) + int(TN)) / (int(TP) + int(TN) + int(FP) + int(FN))
        return int(accuracy * 100)
    except:
        return None

def ETL(inputs, outputs, json_file_path):
    try:
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        if all(key in data[0].keys() for key in inputs + outputs):
            existing_entry = next((entry for entry in data if all(entry[key] == value for key, value in zip(inputs, inputs))), None)
            if existing_entry:
                data.remove(existing_entry)
            data.append(dict(zip(inputs + outputs, inputs + outputs)))
        else:
            sample_data = data[0]
            keys = list(sample_data.keys())
            joined_list = inputs + outputs
            new_data = {}
            for i, key in enumerate(keys):
                # json_log(f"{joined_list}")
                new_data[key] = joined_list[i]
            data.append(new_data)
        with open(json_file_path, 'w') as f:
            json.dump(data, f)
    except:
        print('Level data modifing not possible\n')

def deviation(actual, assumption):
    if (actual <= 1 and actual >= 0) and (assumption <= 1 and assumption >= 0):
        result = actual - assumption
    else:
        result = 1
    return result

def shuffle_and_update(json_file_path, basis):
    with open(json_file_path) as f:
        dataset = json.load(f)
    random.shuffle(dataset)
    for i, item in enumerate(dataset):
        item[str(basis)] = i + 1
    with open(json_file_path, 'w') as f:
        json.dump(dataset, f)

def synthesis(dataset, col_name, options, musk):
    if(len(dataset) > 1):
        for i in range (len(dataset)):
            for j in range (len(options)):
                if dataset[i][col_name] == options[j]:
                    dataset[i][col_name] = musk[j]
    else:
        for i in range (len(dataset[0])):
            for j in range (len(options)):
                if dataset[0][i] == options[j]:
                    dataset[0][i] = musk[j]
    
    return dataset