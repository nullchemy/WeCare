from .electra import electra
from .cnn import cnn
from .bert import bert
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io
import datetime
import os

def check_intent(text, model):
  respnse = None
  if model == 'electra':
    respnse =  electra(text)
  elif model == 'bert':
    respnse = bert(text)
  elif model == 'cnn':
    respnse = cnn(text)
  else:
    respnse = electra(text)
  print(respnse)
  return respnse


def format_timestamp(timestamp):
    # Convert timestamp to datetime object
    dt_object = datetime.datetime.fromtimestamp(timestamp / 1000)
    # Format datetime object to desired format
    formatted_timestamp = dt_object.strftime("%I:%M%p")
    return formatted_timestamp

def generate_pdf(json_data):
    # Create a new PDF object

    output_stream = io.BytesIO()
    pdf = SimpleDocTemplate(output_stream, title="Bot Chat Report", pagesize=letter, leftMargin=20, rightMargin=20, topMargin=20, bottomMargin=20)
    content = []

    heading_text = "<b><font size='24'>WECARE MENTAL HEALTH AND SUICIDE DETECTION CHAT-APP</font></b>"
    heading_paragraph_style = getSampleStyleSheet()["Title"]
    heading_paragraph_style.alignment = 0
    heading_paragraph = Paragraph(heading_text, heading_paragraph_style)
    content.append(heading_paragraph)
    content.append(Spacer(1, 24))

    # Introduction Paragraph
    intro_text = "<p>This is a summary report of user's messages chat predictions from the Model.</p>"
    intro_paragraph_style = getSampleStyleSheet()["BodyText"]
    intro_paragraph_style.alignment = 0
    intro_paragraph = Paragraph(intro_text, intro_paragraph_style)
    content.append(intro_paragraph)
    content.append(Spacer(1, 12))

    # Add headers
    headers = ["Timestamp", "Message", "Model", "Prediction", "Actual Value"]
    data = [headers]

    # Convert JSON data to table format
    for item in json_data:
        formatted_timestamp = format_timestamp(item['timestamp'])
        try:
            prediction_text = "suicidal" if item['analysis']['prediction'] == 1 else "non-suicidal"
        except KeyError:
            prediction_text = "-"

        try:
            actual_value = round(item['analysis']['actual_value'], 6)
        except KeyError:
            actual_value = "-"
        data.append([ 
                     formatted_timestamp, Paragraph(item['message']), item['model'], 
                     prediction_text, actual_value])

    # Create table
    table = Table(data)
    style = TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('WORDWRAP', (1, 0), (1, -1), True),])
    table.setStyle(style)

    # Set column widths
    col_widths = [0.58 * letter[0] / len(headers)] * len(headers)  # Divide page width evenly among columns
    col_widths[1] *= 4  # Increase width of message column
    print(col_widths)
    table._argW = col_widths

    # Build content
    content.append(table)

    # Footer Paragraph
    current_date = datetime.datetime.now().strftime("%d/%m/%Y %I:%M%p")
    footer_text = f"Generated on: {current_date}"
    footer_paragraph = Paragraph(footer_text, getSampleStyleSheet()["BodyText"])
    content.append(Spacer(1, 24))  # Add spacer for line break
    content.append(footer_paragraph)

    # Add table to PDF
    pdf.build(content)

    return output_stream