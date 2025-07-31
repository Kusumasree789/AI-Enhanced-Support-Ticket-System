# AI-Powered Support Ticket Management System

A scalable and intelligent ticket management platform that leverages AWS services to automate ticket prioritization, enhance customer support, and provide real-time analytics.

---

## 🚧 Current Limitations (Before Implementation)

- Manual ticket sorting leads to delays
- Time-consuming ticket prioritization
- Difficulty finding past solutions for recurring issues
- No performance insights for team leads or managers
- Scalability issues with a growing user base

---

## 🚀 Project Overview

### Key Features:

- ✅ **AI-powered automated ticket prioritization**
- 📚 **Smart knowledge base with past solution suggestions**
- 📊 **Real-time dashboard with historical analytics**
- 🔐 **Secure user authentication with OTP verification**

---

## 🧰 Services Used

### AWS Services:

- **Amazon SES** – For sending OTPs and email notifications  
- **Amazon Comprehend** – NLP engine to auto-categorize and prioritize tickets  
- **Amazon RDS** – For secure relational database storage  
- **Amazon S3** – To store attachments like screenshots and documents  
- **Amazon VPC** – To isolate and protect our infrastructure  

### Frameworks & Tools:

- **Frontend:** React.js  
- **Backend:** Flask  
- **SDK:** Boto3 for AWS integrations

---

## 🛠 Architecture Workflow

1. **User Authentication:**
   - Users sign up/login with OTP sent via **Amazon SES**

2. **Ticket Submission:**
   - Users submit tickets with optional file attachments (stored in **Amazon S3**)
   
3. **AI Prioritization:**
   - **Amazon Comprehend** analyzes text and assigns ticket priority: Critical / High / Medium / Low

4. **Storage:**
   - All ticket and user data securely stored in **Amazon RDS**

5. **Networking:**
   - Services are securely connected via **Amazon VPC**

---

## 🎯 Who Benefits?

| Sector              | Benefits                                                                 |
|---------------------|--------------------------------------------------------------------------|
| Education           | Handles student support (exam queries, account issues) efficiently       |
| Government Services | Enables public complaint categorization with automated prioritization    |
| Healthcare          | Manages appointments and medical record requests with reduced wait times |
| Travel & Hospitality| Improves service speed for booking and inquiry handling                  |

---

## 🔮 What’s Next?

- 🤖 Train custom models to enhance ticket prioritization accuracy
- 🌐 Add language detection and translation for multilingual support
- 🗣️ Integrate live chat and call support for real-time resolution
- 🔔 Enable real-time notifications for ticket status updates
- 📤 Move SES out of sandbox and add time limits for low-priority tickets

---

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to create a pull request or open an issue.

---

## How to Contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make the necessary changes.
4. Commit your changes.
5. Push to your forked repository.

---

