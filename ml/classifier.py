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
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import RidgeCV
from sklearn.linear_model import ElasticNetCV
from sklearn import preprocessing
from sklearn import svm
import matplotlib.pyplot as plt

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
			#add district and level
			level = get_level(row[57])
			district = get_district(row[63])
			discrete_ids = numpy.array([district, level])
			add_feat(discrete_clf.predict(discrete_ids)[0], feat)

			#teacher information makes no difference!
			#add teachers
			for i in range(27, 31):
				add_feat(row[i], feat)
			
			successes.append(succ)
			feats.append(feat)

	return (successes, feats)

def get_level(level):
	if level == "Middle":
		level = 0
	elif level == "Primary":
		level = 1
	elif level == "High":
		level = 2
	elif level == "Other":
		level = 3
	else:
		level = -1
	return level

def get_district(district):
	if district == "":
		district = -1
	return district

def load_district(file_path):

	successes = []
	feats = []
	with open(file_path, 'r', encoding='latin1') as file_reader:
		reader = csv.reader(file_reader, delimiter=',', quotechar='"')
		for row in reader:
			succ = (int(float(row[2])))
			#add district
			feat = []
			district = get_district(row[63])
			feat.append(district)

			#add level
			level = get_level(row[57])
			feat.append(level)
			
			successes.append(succ)
			feats.append(feat)

	return (successes, feats)

def discrete_classify(file_path):
	(training_labels, district_ids) = load_district(file_path)

	# Get training features using vectorizer
	#scaler = preprocessing.StandardScaler()
	district_ids = numpy.array(district_ids)

	#training_features = scaler.fit_transform(training_ratios)

	# Transform training labels to numpy array (numpy.array)
	training_labels = numpy.array(training_labels)
	############################################################

	classifier = svm.SVC()
	classifier.fit(district_ids, training_labels)

	return classifier


def add_feat(toAdd, feat):
	if toAdd != "": 
		feat.append(float(toAdd))
	else:
		feat.append(-1)

def main():

	##### DO NOT MODIFY THESE OPTIONS ##########################
	parser = argparse.ArgumentParser()
	parser.add_argument('-training', required=True, help='Path to training data')
	parser.add_argument('-test', required=True, help='Path to test data')
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
	# Print training mean accuracy using 'score'
	#print('training mean accuracy:', classifier.score(training_features, training_labels))

	# Perform 10 fold cross validation (cross_val_score) with scoring='accuracy'

	scores = cross_val_score(classifier, training_features, training_labels, cv=10) 
	mean = numpy.mean(scores)
	std_dev = numpy.std(scores)

	print("\n")
	print("######## CLASSIFIER SCORE #########")

	#Print the mean and std deviation of the cross validation score
	print('mean and std dev for cross validation scores:', mean, std_dev)

	###########################################################

	# Test the classifier on the given test set
	# Load test labels and texts using load_file()
	(test_labels, test_ratios) = load_file(opts.test, discrete_clf)

	test_ratios = numpy.array(test_ratios)
	#test_ratios = test_ratios.reshape(-1, 1)

	# Extract test features using vectorizer.transform()
	test_features = scaler.transform(test_ratios)

	# Predict the labels for the test set
	predicted_labels = classifier.predict(test_features)
	#print(predicted_labels)

	# Print mean test accuracy
	#print('predicted mean accuracy:', accuracy_score(test_labels, predicted_labels))

	#print('sklearn confusion matrix:', confusion_matrix(test_labels, predicted_labels))
	print('classifier score: ', classifier.score(test_features, test_labels))

	fig, ax = plt.subplots()
	ax.scatter(test_labels, predicted_labels, color='#d7a29e', s=3)
	ax.plot([0, 10], [0, 10], 'k--', lw=2, color='#595a6d')
	ax.set_xlabel('Measured')
	ax.set_ylabel('Predicted')
	plt.title('Overall Classifier Accuracy')
	plt.savefig('plot.png', dpi=300, size='xx-large')

	within_three_l = 0
	within_two_l = 0
	within_one_l = 0
	within_half_l = 0
	within_half_h = 0
	within_one_h = 0
	within_two_h = 0
	within_three_h = 0
	outliers = []

	dists = []
	abs_dists = []

	for i in range(0, len(test_labels)):
		dist = test_labels[i] - predicted_labels[i]
		abs_dists.append(abs(test_labels[i] - predicted_labels[i]))
		if dist > -3 and dist < -2:
			within_three_l += 1
		if dist > -2 and dist < -1:
			within_two_l += 1
		if dist > -1 and dist < -0.5:
			within_one_l += 1
		if dist > -0.5 and dist < 0:
			within_half_l += 1
		if dist < 0.5 and dist > 0:
			within_half_h += 1
		if dist < 1 and dist > 0.5:
			within_one_h += 1
		if dist < 2 and dist > 1: 
			within_two_h += 1
		if dist < 3 and dist > 2:
			within_three_h += 1
		if dist >= 3 or dist <= -3: 
			outliers.append(test_labels[i])
		dists.append(dist)


	print("\n")
	print("######## PERCENTAGES #########")
	print("percentage within 3 low:", within_three_l/len(test_labels))
	print("percentage within 2 low:", within_two_l/len(test_labels))
	print("percentage within 1 low:", within_one_l/len(test_labels))
	print("percentage within 0.5 low:", within_half_l/len(test_labels))
	print("percentage within 0.5 high:", within_half_h/len(test_labels))
	print("percentage within 1 high:", within_one_h/len(test_labels))
	print("percentage within 2 high:", within_two_h/len(test_labels))
	print("percentage within 3 high:", within_three_h/len(test_labels))

	print("\n")
	print("average prediction: ", sum(dists)/len(dists))
	print("average distance from predicted score: ", sum(abs_dists)/len(dists))
	print("median distance from predicted score: ", statistics.median(abs_dists))
	print("number of outliers: ", len(outliers))
	print(outliers)

	x_data = [-3, -2, -1, -0.5, 0.5, 1, 2, 3]
	y_data = [within_three_l, within_two_l, within_one_l, within_half_l, within_half_h, within_one_h, within_two_h, within_three_h]

	fig, ax = plt.subplots()
	#plt.plot(x_data, y_data)
	y_pos = [0, 1, 2, 3, 4, 5, 6, 7]
	plt.bar(y_pos, y_data, align='center', color='#595a6d')
	plt.xticks(y_pos, x_data)
	ax.set_xlabel('Distance of Measured from Predicted Success')
	ax.set_ylabel('Number of Points in Region')
	plt.title('Classifier Accuracy Distribution')
	plt.savefig('distribution.png', dpi=300, size='xx-large')


if __name__ == '__main__':
	main()
