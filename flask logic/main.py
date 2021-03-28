import time
import flask
from flask import request, jsonify
from flask_cors import CORS
from google.cloud import vision
import io
import os
from twilio.rest import Client
from datetime import datetime
import json
from twilio.twiml.messaging_response import MessagingResponse
import sqlite3
import requests
import schedule
import atexit
from apscheduler.schedulers.background import BackgroundScheduler

app = flask.Flask(__name__)
CORS(app)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "My First Project-256dbe03ec7e.json"

def check_appointments(event=None, context=None):
    mydb = sqlite3.connect('reminders.db')
    mycursor = mydb.cursor()
    current_day = datetime.today().day
    current_month = datetime.today().month
    current_hour = datetime.today().hour

    formatted_date = datetime.today().strftime("%B, %d")
    mycursor.execute("SELECT * FROM reminders")
    output = mycursor.fetchall()

    for reminder in output:
        if reminder[7] == "D":
            if reminder[3] == current_hour and reminder[5] <= reminder[6]:
                if reminder[8] == 'sms':
                    print("SMS sent")
                    send_sms_message(reminder)
                elif reminder[8] == 'phoneCall':
                    print("Call sent")
                    send_call_message(reminder)
                c = reminder[5] + 1
                sql = "UPDATE reminders SET count = ? WHERE name = ? AND phone = ? AND title = ?"
                val = (str(c), reminder[0], reminder[1], reminder[2])
                mycursor.execute(sql, val)
                mydb.commit()

        elif reminder[7] == "W":
            if reminder[3] == current_day and reminder[5] <= reminder[6] and current_hour == "18":
                if reminder[8] == 'sms':
                    print("SMS sent")
                    send_sms_message(reminder)
                elif reminder[8] == 'phoneCall':
                    print("Call sent")
                    send_call_message(reminder)
                c = reminder[5] + 1
                sql = "UPDATE reminders SET count = ? WHERE name = ? AND phone = ? AND title = ?"
                val = (str(c), reminder[0], reminder[1], reminder[2])
                mycursor.execute(sql, val)
                mydb.commit()

def send_sms_message(reminder):
    account_sid = 'id goes here'
    auth_token = 'token goes here'
    client = Client(account_sid, auth_token)

    message = client.messages \
        .create(
        body=f"Hi, {reminder[0]}. This is a reminder to take {reminder[2]} at a dosage of {reminder[4]}. Reply YES to confirm.",
        from_='+18013370504',
        to=reminder[1]
    )

    print(message.sid)

def send_call_message(reminder):
    account_sid = 'AC54a47a1d46b4b3c91285dba37849b3d2'
    auth_token = '718efa2ce0731bf1451df22aeaf383af'
    client = Client(account_sid, auth_token)
    msg = f"This is a reminder to take, {reminder[2]}, at a dosage of,,, {reminder[4]}."
    call = client.calls.create(
        twiml=f'<Response><Pause length="3"/><Say>Hi, {reminder[0]}! {msg} Again, {msg}</Say></Response>',
        to=reminder[1],
        from_='+18013370504'
    )
    print(call.sid)
"""
scheduler = BackgroundScheduler()
scheduler.add_job(func=check_appointments, trigger="interval", seconds=60)
scheduler.start()
"""
check_appointments()
@app.route('/detect_text', methods=['GET', 'POST'])
def detect_text():
    if request.method == 'POST':
        if os.path.exists("myimg.jpg"):
            os.remove("myimg.jpg")
        print('GOT IN POST')
        post = request.get_json()
        content = requests.get(post['imgDownloadURL']).content

        """
        f = request.files['imgFileData']
        print(f)
        con = f.read()

        d = request.data['otherData']
        print(d)
        """
        """
        other_data = request.files['otherData']
        txt_con = other_data.read()
        with open('myinfo.json', mode='bx') as file:
            file.write(txt_con)
        

        with open('myimg.jpg', mode='bx') as file:
            file.write(con)
            
        path = "myimg.jpg"
        #path = "prescription-label.png"
        
        #Detects text in the file.
        
        print('saved the image')
        with io.open(path, 'rb') as image_file:
            content = image_file.read()
        """
        client = vision.ImageAnnotatorClient()

        image = vision.Image(content=content)

        response = client.text_detection(image=image)
        texts = response.text_annotations
        print('Texts:')
        res = {}

        for text in texts:
            output = '\n"{}"'.format(text.description)
            output = output.split('\n')
            print(output)
            res['number'] = post['phoneNumber']
            res['mode'] = post['notificationMethod']
            res['pharm_name'] = output[1][1:]
            res['address'] = output[2]
            res['pharm-num'] = output[3]
            res['doc_name'] = output[4]
            res['rx_no'] = output[5][7:]
            res['date'] = output[6]
            res['user_name'] = output[7].split()[0].capitalize() + " " + output[7].split()[1].capitalize()
            dose, time = output[8].split(',')
            res['dosage'] = dose[6:]
            res['frequency'] = time[1]
            res['title'] = output[9]
            res['max'] = int(output[10][5:])
            res['refill'] = output[11]
            print(res)
            break

        if response.error.message:
            raise Exception(
                '{}\nFor more info on error messages, check: '
                'https://cloud.google.com/apis/design/errors'.format(
                    response.error.message))

        mydb = sqlite3.connect('reminders.db')
        mycursor = mydb.cursor()
        try:
            if res['frequency'] == "W":
                res['due'] = current_day = str(datetime.today().day)
            elif res['frequency'] == "D":
                res['due'] = current_hour = str(datetime.today().hour)
        except:
            res['frequency'] = 'D'

        sql = "INSERT INTO reminders (name, phone, title, due, dosage, count, max, frequency, mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        val = (res['user_name'], res['number'], res['title'], res['due'], res['dosage'], "0", str(res['max']),
               res['frequency'], res['mode'])

        mycursor.execute(sql, val)
        mydb.commit()
        print(res)
        return jsonify(res), 200


@app.route('/sms_reminder')
def sms_reminder():
    check_appointments()
    return "Success", 200


@app.route('/hack', methods=['GET', 'POST'])
def hack():
    msg = request.values.get('Body').lower() #gets incoming message
    res = MessagingResponse()
    if msg == "yes": #based on incoming message, send different message
        res.message("Taking your pill confirmed!")
    else:
        res.message("Invalid response. Reply YES to confirm. Reply HELP for more options.")
    return str(res)

if __name__ == '__main__':
    app.run()
