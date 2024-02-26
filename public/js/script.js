document.getElementById('send-button').addEventListener('click', function() {
    const input = document.getElementById('chat-input');
    const output = document.getElementById('chat-window');
    console.log(input.text);
    if (input.value !== '') {
        const question = document.createElement('div');
        question.setAttribute('id', 'window-chat-input');
        question.textContent = 'You: ' + input.value;
        output.appendChild(question);
        // Make an AJAX request to the server
        let p = fetch('/get-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: input.value}),
        });
        p.then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            const feedback = document.createElement('div');
            feedback.setAttribute('id', 'chat-output');
            feedback.textContent = 'AI Assistant: ' + data.message.content;
            output.appendChild(feedback);
            output.scrollTop = output.scrollHeight; // Scroll to the bottom
        });
            
        p.catch(() => { 
            console.log('something went wrong');
        });
        

        input.value = ''; // Clear input after sending
    }
});

