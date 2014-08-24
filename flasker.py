from flask import Flask, render_template
import os

tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask('TagSphere', template_folder=tmpl_dir)
@app.route('/')
def hello_world():
	return render_template('demo.html')
if __name__ == '__main__':
	app.debug = True
	app.run()