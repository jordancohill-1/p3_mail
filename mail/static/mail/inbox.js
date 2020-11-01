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
      emails.forEach((email) => {


        var background_color = email.read ? 'WhiteSmoke' : 'white';

        let item = document.createElement('div');
        item.innerHTML = `
        <div class="container" style="background-color:${background_color}">
          <div id="row" class="border row">
            <div class="col-sm">
              <label>${email.sender}</label>
            </div>
            <div class="col-sm">
              <div> ${email.subject}</div>
            </div>
            <div class="col-sm" style="text-align:right;">
               ${email.timestamp}
            </div>
          </div>
        </div>
       `;
        item.addEventListener('click', function() {
          get_email(email.id, mailbox);
          //check if !read and user is recipient 
          if(!email.read && mailbox == 'inbox'){
             mark_read(email.id);   
            }
        });
        display.appendChild(item);

      });
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

function get_email(email_id, mailbox) {
  //show only selected email
  show_selected_view();

  fetch(`emails/${email_id}`)
  .then(response => response.json())
    .then( email => {
      create_selected_html(email, mailbox);      
   }).catch((error) => {
        console.log(error);
  });

}

function create_selected_html(email, mailbox){
  const view = document.querySelector('#inner-selected-view');
  const outer_view = document.querySelector('#outer-selected-view');
  //clear div or it will keep appending
  view.innerHTML = "";
  outer_view.innerHTML = "";
  let info = document.createElement('div');
      info.innerHTML =`
      <label>From: </label> ${email.sender}<br/>
      <label>To: </label> ${email.recipients}<br/>
      <label>Subject: </label> ${email.subject}<br/>
      <label>Timestamp: </label> ${email.timestamp}<br/>
      `;

  //create reply button and pass email to reply()
  let reply_button = document.createElement('BUTTON');
      reply_button.innerHTML = 'Reply';
      reply_button.className = `btn btn-sm btn-outline-primary`;
      reply_button.addEventListener('click', function() {
          reply(email);
        });

  let email_body = document.createElement('div');
      email_body.innerHTML = `<div>${email.body}</div>`;

      view.append(info);
      view.append(reply_button);
      outer_view.append(email_body);

//CONDITIONAL ARCHIVE BUTTON
  if(mailbox != 'sent'){
  var is_archived = email.archived ? 'Unarchive' : 'Archive';
  let archive_button = document.createElement('BUTTON');
      archive_button.innerHTML = `${is_archived}`;
      archive_button.className = `btn btn-sm btn-outline-danger`;
      archive_button.addEventListener('click', function() {
        archive(email);
        });
      view.append(archive_button);
  }

}

function mark_read(email_id){
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
  }).catch((error) => {
        console.log(error);
  });
}


function archive(email){
  fetch(`emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !email.archived
    })   
  }).catch((error) => {
        console.log(error);
  });
  //Once an email has been archived or unarchived, load the user’s inbox.
  load_mailbox('inbox')
}

function reply(email){
  show_compose_view();
  document.querySelector('#compose-recipients').value = email.sender;
  //(If the subject line already begins with Re: , no need to add it again.) https://javascript.info/regexp-anchors
  let subject = email.subject;
  if(!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value =`\n On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;

}