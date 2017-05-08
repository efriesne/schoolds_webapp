#!/usr/bin/env python3
import re
import csv

import random

from operator import itemgetter

def separate_data():
	test = []
	training = []
	with open('cumulative.csv','r') as inputfile:
		reader = csv.reader(inputfile)
		#skip over header
		next(reader, None)
		#for each row
		for row in reader:
			rand = random.random()*5
			if rand < 4:
				training.append(row)
			else:
				test.append(row)
	return training, test

def write_data(training, test):
	with open('training.csv','w') as outputfile:
		writer = csv.writer(outputfile)
		for record in training:
			writer.writerow(record)

	with open('test.csv','w') as outputfile:
		writer = csv.writer(outputfile)
		for record in test:
			writer.writerow(record)

if __name__ == '__main__':
    training, test = separate_data()
    write_data(training, test)
    print("training l is ", len(training))
    print("testing l is ", len(test))
