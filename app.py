from flask import Flask, request, jsonify, render_template
import pandas as pd

app = Flask(__name__)

dataframe_cache = pd.DataFrame()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    global dataframe_cache
    if 'file' not in request.files:
        return "File tidak ditemukan", 400
    file = request.files['file']
    if file.filename == '':
        return "File tidak dipilih", 400

    try:
        df = pd.read_csv(file)
        # Pastikan kolom ada agar tidak error
        required_cols = [
            'protoPayload.authenticationInfo.principalEmail',
            'protoPayload.requestMetadata.callerSuppliedUserAgent',
            'protoPayload.requestMetadata.callerIp',
            'timestamp'
        ]
        for col in required_cols:
            if col not in df.columns:
                df[col] = ''

        dataframe_cache = df
        return "Upload berhasil", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

@app.route('/search', methods=['GET'])
def search():
    global dataframe_cache
    if dataframe_cache.empty:
        return jsonify([])

    keyword = request.args.get('keyword', '').lower()

    df = dataframe_cache.copy()
    df.fillna('', inplace=True)

    if keyword:
        mask = (
            df['protoPayload.authenticationInfo.principalEmail'].astype(str).str.lower().str.contains(keyword) |
            df['protoPayload.requestMetadata.callerSuppliedUserAgent'].astype(str).str.lower().str.contains(keyword) |
            df['protoPayload.requestMetadata.callerIp'].astype(str).str.lower().str.contains(keyword) |
            df['timestamp'].astype(str).str.lower().str.contains(keyword)
        )
        df = df[mask]

    return jsonify(df.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
    
# To run the app, use the command: python app.py
# Make sure to have Flask and pandas installed in your environment
# You can install them using pip:
# pip install Flask pandas
# The HTML template 'index.html' should be created in a 'templates' folder
# with a form to upload files and a section to display search results.
# The HTML template should include a form for file upload and a search input
# with a button to trigger the search.
# The search results will be displayed in a JSON format.
# The app will run on http://
