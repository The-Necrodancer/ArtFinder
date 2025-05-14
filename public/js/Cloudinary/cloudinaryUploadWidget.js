const imageMimeTypes = [
  'webp',
  'png',
  'jpeg',
  'jpg',
];

document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/api/signuploadwidget');
  const data = await response.json();
  const errorMsg = document.getElementById('add-img-form-error');
  errorMsg.innerHTML = ""; 

  const options = {
    cloudName: 'dbozj84g9',
    apiKey: '228588796346678',
    uploadSignatureTimestamp: data.timestamp,
    uploadSignature: data.signature,
    cropping: false,
    folder: 'signed_upload_demo_uw'
  }

  let imgUrls = []; 

  const processResults = (error, result) => {
    if (!error && result && result.event === 'success') {
        errorMsg.innerText = ''; 
        let filetype = result.info.url.split('.').pop(); 
        if( !imageMimeTypes.includes(filetype)) {
          
          errorMsg.innerText = "Error: only jpg, jpeg, png, and webp types are accepted.";
        } else {
          imgUrls.push(result.info.url); 
          document.getElementById('upload_form_images_div').innerHTML += `<img src="${result.info.url}" alt="New Artwork" class="img-upload-img"/>`;
        }
    }
  }

  const myWidget = window.cloudinary.createUploadWidget(
    options,
    processResults
  );

   document
    .getElementById('upload_widget')
    .addEventListener('click', () => myWidget.open(), false)  


    document 
    .getElementById('add-img-form')
    .addEventListener('submit', async (event) => {
        event.preventDefault(); 
        if(imgUrls.length != 0) {
            let postResponse = await fetch('/dashboard/artist', {
                method: 'POST', 
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({imgUrls})
            }); 
           window.location.reload();
        }
    })
})
