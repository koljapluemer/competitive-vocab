from flask import Flask, render_template, redirect, request, url_for

import csv
import random
import os

app = Flask(__name__)
static_folder_path = os.path.join(app.root_path, 'static')
vocab_csv_name = 'vocab_marta_24_10_1.csv'

def get_vocab():
    vocab = []
    csv_path = os.path.join(static_folder_path, vocab_csv_name)
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            if row[0] and row[1]:
                vocab.append(row)
    return vocab

def get_random_question(vocab):
    # Pick one random vocab pair
    picked_vocab = random.choice(vocab)

    # Get three other random wrong answers
    list_without_picked = [x for x in vocab if x != picked_vocab]
    wrong_answers = random.sample(list_without_picked, 3)

    answer_options = [
        picked_vocab[1],
        wrong_answers[0][1],
        wrong_answers[1][1],
        wrong_answers[2][1]
    ]
    random.shuffle(answer_options)

    return picked_vocab[0], picked_vocab[1], answer_options

@app.route('/')
def main_test():
    vocab = get_vocab()
    en_prompt, correct_answer, answer_options = get_random_question(vocab)
    return render_template('game_from_four.html', en_prompt=en_prompt, answer_options=answer_options, correct_answer=correct_answer)

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    selected_answer = request.form.get('selected_answer')
    correct_answer = request.form.get('correct_answer')
    wrong_count = int(request.form.get('wrong_count', 0))

    if selected_answer == correct_answer:
        # Log wrong attempts or handle it in some way
        print(f"Correct answer selected after {wrong_count} wrong attempts.")
        
        # Serve a new question
        vocab = get_vocab()
        en_prompt, correct_answer, answer_options = get_random_question(vocab)
        return render_template('game_from_four.html', en_prompt=en_prompt, answer_options=answer_options, correct_answer=correct_answer)
    else:
        # This branch won't be hit due to JS preventing wrong answers submission
        return redirect(url_for('main_test'))  # Fallback just in case

if __name__ == '__main__':
    app.run(debug=True)
