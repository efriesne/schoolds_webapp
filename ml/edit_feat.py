#!/usr/bin/env python3
import re
import csv
import argparse
import sys

import random

from operator import itemgetter

def separate_data():
	with open('feature.csv','r') as inputfile:
		reader = csv.reader(inputfile)
		#for each row
		for row in reader:
			feature = row
	return feature

def update_feature(feature):
	for i in range(0, len(opts.fields)):
		feature[opts.fields[i]] = opts.vals[i]
	with open('feature.csv','w') as outputfile:
		writer = csv.writer(outputfile)
		writer.writerow(feature)
	print("updated feature to ", feature)

if __name__ == '__main__':

	parser = argparse.ArgumentParser()
	#parser.add_argument('-char_type', type=str, required=True, help='Path to characteristic type')
	parser.add_argument('-fields', type=int, nargs='+', required=True, help='Path to field to update')
	parser.add_argument('-vals', type=float, nargs='+', required=True, help='Path to field to update')
	opts = parser.parse_args()

	if len(opts.fields) != len(opts.vals):
		print("Error: fields and vals length must match")
		exit(1)

	feature = separate_data()
	update_feature(feature)
    #write_data(training, test)
    #print("training l is ", len(training))
    #print("testing l is ", len(test))