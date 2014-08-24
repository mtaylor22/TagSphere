from flask import Flask, render_template
import os
app = Flask('TagSphere')

@app.route('/')
def demo():
	return render_template('demo.html')

if __name__ == '__main__':
	app.debug = True
	app.run()