package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
)

type EmailData struct {
	SenderName string `json:"sendername"`
	ReplyTo    string `json:"replyto"`
	Subject    string `json:"subject"`
	Message    string `json:"message"`
}

func sendEmail(w http.ResponseWriter, r *http.Request) {
	// إعدادات CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// استجابة للـ Preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// قبول فقط POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var data EmailData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// إعدادات البريد
	from := "yasuruha1@gmail.com"
	password := "rdbp dqcq hvnp mlbk" // استخدم كلمة مرور التطبيقات
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	to := "yasuruha1@gmail.com"

	// تحسين شكل الرسالة
	message := fmt.Sprintf("To: %s\r\n", to) +
		fmt.Sprintf("From: %s <%s>\r\n", data.SenderName, data.ReplyTo) +
		fmt.Sprintf("Reply-To: %s\r\n", data.ReplyTo) +
		"Subject: " + data.Subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=\"UTF-8\"\r\n" +
		"\r\n" +
		fmt.Sprintf("👤 الاسم: %s\n✉️ البريد: %s\n\n📨 الرسالة:\n%s\n", data.SenderName, data.ReplyTo, data.Message)

	// مصادقة
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// إرسال
	err = smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(message))
	if err != nil {
		http.Error(w, "فشل في إرسال الرسالة: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("تم إرسال البريد الإلكتروني بنجاح ✅"))
}

func main() {
	http.HandleFunc("/send", sendEmail)
	fmt.Println("🔗 الخادم يعمل على: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
