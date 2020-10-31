document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  //Send email and prevent loading inbox
  document.querySelector("#compose-form").addEventListener("submit", (event) => {
      event.preventDefault();
      send_email();
    });

});

/**************PAGE CONTROLS******************/
function show_compose_view(){
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#selected-view').style.display = 'none';

}

function show_email_view(){
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#selected-view').style.display = 'none';
}

function show_selected_view(){
  // Show the selected view and hide others
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#selected-view').style.display = 'block';

}

function compose_email() {
  show_compose_view();
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

/**************END CONTROLS******************/

function load_mailbox(mailbox) {
  show_email_view();
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
 
  //When a user visits their Inbox, Sent mailbox, or Archive, load the appropriate mailbox.
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
    .then( emails => {

      const display = document.querySelector('#emails-view');
      const list = document.createElement('ul');

      emails.forEach((email) => {
        //Create li for each email
        let item = document.createElement('li');

        item.innerHTML = `${email.sender}  ${email.subject}  ${email.timestamp}`;
        list.appendChild(item);
        item.addEventListener('click', function() {
          get_email(email.id);
        });

      });
      display.appendChild(list);
      console.log(emails);
    }).catch((error) => {
        console.log(error);
  });
}

function send_email() {
  //GET FORM
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  //POST FORM
  fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    load_mailbox('sent');
});
  
}

function get_email(email_id) {
  //show only selected email
  show_selected_view();

  fetch(`emails/${email_id}`)
  .then(response => response.json())
    .then( email => {
      create_selected_html(email.sender, email.recipients, email.subject, email.timestamp, email.body);
   }).catch((error) => {
        console.log(error);
  });
}

function create_selected_html(sender, recipients, subject, timestamp, body){
  const view = document.querySelector('#inner-selected-view');
  let info = document.createElement('div');
      info.innerHTML =`
      <label>From: </label> ${sender}<br/>
      <label>To: </label> ${recipients}<br/>
      <label>Subject: </label> ${subject}<br/>
      <label>Timestamp: </label> ${timestamp}<br/>
      `;

  //create reply button and pass email to reply()
  let reply_button = document.createElement('BUTTON');
      reply_button.innerHTML = 'Reply';
      reply_button.className = `btn btn-sm btn-outline-primary`;
      reply_button.addEventListener('click', function() {
          reply(sender, subject, body, timestamp);
        });
      view.appendChild(info);
      view.appendChild(reply_button);

}

function reply(recipients, subject, body, timestamp){
  show_compose_view();
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body + timestamp;

}

function archive(email_id, is_archived){
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: is_archived
    })
  });
}
