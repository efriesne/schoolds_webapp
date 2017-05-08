TO SAVE THE CLASSIFIERS:
run save_classifier.py -training training.csv

TO EDIT THE INPUT FEATURE/CHARACTERISTIC FROM USER INPUT:
run edit_feat.py -fields [list of fields (indexes) to edit] -vals [list of values to replace fields by]
e.g. `python3 edit_feat.py -fields 15 18 21 -vals 1.0 2 33.5`
This updates the feature.csv to reflect the new input values

run predict_success.py -test test.csv

TO LOOK UP FIELD NUMBERS:
hardcode based on data_dict.csv

TO RUN THE WHOLE CLASSIFICATION
run classifier.py -training training.csv -test test.csv
