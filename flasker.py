from flask import Flask, render_template
import os
app = Flask('TagSphere')

@app.route('/demo')
def demo():
	return render_template('demo.html')
@app.route('/')
def demo():
	return render_template('index.html')

if __name__ == '__main__':
	app.debug = True
	app.run()