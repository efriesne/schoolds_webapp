from __future__ import division
import sys
import csv
import argparse
from collections import defaultdict

import numpy
import statistics
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import confusion_matrix
from sklearn.metrics import accuracy_score
from sklearn.model_selection import cross_val_score
from sklearn.naive_bayes import BernoulliNB
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import RidgeCV
from sklearn.linear_model import ElasticNetCV
from sklearn import preprocessing
from sklearn import svm
#import matplotlib.pyplot as plt
from sklearn.externals import joblib

def load_file(file_path, discrete_clf):
	successes = []
	feats = []
	with open(file_path, 'r', encoding='latin1') as file_reader:
		reader = csv.reader(file_reader, delimiter=',', quotechar='"')
		for row in reader:
			succ = (float(row[2]))
			#starts at 10
			feat = []

			#add total enrollment
			add_feat(row[7], feat)
			#add selected population
			for i in range(10, 23):
				add_feat(row[i], feat)
			#add race
			for i in range(33, 38):
				add_feat(row[i], feat)
			#add gender
			for i in range(38, 40):
				add_feat(row[i], feat)
			#add higher ed
			for i in range(42, 47):
				add_feat(row[i], feat)
			#add incidents
			for i in range(47, 51):
				add_feat(row[i], feat)
			#add year
			add_feat(row[1], feat)

			#add charter
			add_feat(row[56], feat)
			#add district
			add_feat(discrete_clf.predict(float(row[63]))[0], feat)

			#add teachers
			for i in range(27, 31):
				add_feat(row[i], feat)
			
			successes.append(succ)
			feats.append(feat)

	return (successes, feats)

def add_feat(toAdd, feat):
	if toAdd != "": 
		feat.append(float(toAdd))
	else:
		feat.append(-1)

def load_district(file_path):

	successes = []
	feats = []
	with open(file_path, 'r', encoding='latin1') as file_reader:
		reader = csv.reader(file_reader, delimiter=',', quotechar='"')
		for row in reader:
			succ = (int(float(row[2])))
			#add district
			feats.append(row[63])
			successes.append(succ)

	return (successes, feats)

def discrete_classify(file_path):
	(training_labels, district_ids) = load_district(file_path)

	# Get training features using vectorizer
	#scaler = preprocessing.StandardScaler()
	district_ids = numpy.array(district_ids)
	district_ids = district_ids.reshape(-1, 1)

	#training_features = scaler.fit_transform(training_ratios)

	# Transform training labels to numpy array (numpy.array)
	training_labels = numpy.array(training_labels)
	############################################################

	classifier = svm.SVC()
	classifier.fit(district_ids, training_labels)

	return classifier

def main():

	##### DO NOT MODIFY THESE OPTIONS ##########################
	parser = argparse.ArgumentParser()
	parser.add_argument('-training', required=True, help='Path to training data')
	opts = parser.parse_args()
	############################################################

	##### BUILD TRAINING SET ###################################

	discrete_clf = discrete_classify(opts.training)

	# Load training text and training labels
	(training_labels, training_ratios) = load_file(opts.training, discrete_clf)

	# Get training features using vectorizer
	scaler = preprocessing.StandardScaler()
	training_ratios = numpy.array(training_ratios)
	#training_ratios = training_ratios.reshape(-1, 1)
	training_features = scaler.fit_transform(training_ratios)

	# Transform training labels to numpy array (numpy.array)
	training_labels = numpy.array(training_labels)
	############################################################

	##### TRAIN THE MODEL ######################################
	# Initialize the corresponding type of the classifier
	# NOTE: Be sure to name the variable for your classifier "classifier" so that our stencil works for you!
	#classifier = svm.SVC(C=1.0, kernel='rbf',gamma=1.65)
	classifier = ElasticNetCV(l1_ratio=0.9)
	# # Train your classifier using 'fit'
	classifier.fit(training_features, training_labels)

	############################################################

	###### VALIDATE THE MODEL ##################################
	# Perform 10 fold cross validation (cross_val_score) with scoring='accuracy'
	scores = cross_val_score(classifier, training_features, training_labels, cv=10) 
	mean = numpy.mean(scores)
	std_dev = numpy.std(scores)

	print("######## CLASSIFIER SCORE #########")

	#Print the mean and std deviation of the cross validation score
	print('mean and std dev for cross validation scores:', mean, std_dev)

	############################################################

	###### SAVE THE CLASSIFIER ##################################
	joblib.dump(classifier, 'clf.pkl')
	joblib.dump(scaler, 'scaler.pkl')
	joblib.dump(discrete_clf, 'discrete_clf.pkl')

if __name__ == '__main__':
	main()
