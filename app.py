from flask import Flask, render_template

import csv
import random
import os


app = Flask(__name__)
static_folder_path = os.path.join(app.root_path, 'static')
vocab_csv_name = 'vocab_marta_24_10_1.csv'

@app.route('/')
def main_test():
    # load static file vocab_marta_24_10_1.csv 
    # ONLY rows where the first and 2nd column are non-empty are valid vocab
    # pick one word combination randomly and serve to template
    vocab = []
    csv_path = os.path.join(static_folder_path, vocab_csv_name)
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0] and row[1]:
                vocab.append(row)

    picked_vocab = random.choice(vocab)

    list_without_picked = [x for x in vocab if x != picked_vocab]
    first_wrong_answer = random.choice(list_without_picked)
    list_without_picked = [x for x in list_without_picked if x != first_wrong_answer]
    second_wrong_answer = random.choice(list_without_picked)
    list_without_picked = [x for x in list_without_picked if x != second_wrong_answer]
    third_wrong_answer = random.choice(list_without_picked)

    answer_options = [
        picked_vocab[1],
        first_wrong_answer[1],
        second_wrong_answer[1],
        third_wrong_answer[1]
    ]
    random.shuffle(answer_options)

    return render_template('game_from_four.html', en_prompt=picked_vocab[0], answer_options=answer_options, correct_answer=picked_vocab[1])