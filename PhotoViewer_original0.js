var albumBucketName = 'pyscrapedd';

// **DO THIS**:
//   Replace this block of code with the sample code located at:
//   Cognito -- Manage Identity Pools -- [identity_pool_name] -- Sample Code -- JavaScript
//
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:2bd2d00c-7aa5-4035-aad3-7af924f85754',
});

// Create a new service object
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});

// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}
// snippet-end:[s3.JavaScript.s3_PhotoViewer.config]


//
// Functions
//

// snippet-start:[s3.JavaScript.s3_PhotoViewer.listAlbums]
// List the photo albums that exist in the bucket.
function listAlbums() {
  const albumName = "NorthernMtns/";
  s3.listObjects({Prefix: albumName}, function(err, data) {
  //var albumPhotosKey = encodeURIComponent(albumName) + '/';
  //s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // 'this' references the AWS.Request instance that represents the response
  //////////////
  const groups = {};
  data.Contents.forEach(e => {
    //console.log(e.LastModified);
    const [_, key, name] = e.Key.split("/");
    const split = name.match(/-([-\d]+)\.(?:png|jpg|jpeg)$/)[1].split("-");
    e.date = new Date(split.slice(0, 3).join("-") + "T" + split.slice(3).join(":"));

    if (!(key in groups)) {
      groups[key] = [];
    }

    groups[key].push(e);
  });

  for (const group in groups) {
    groups[group].sort((a, b) => a.date - b.date)
  }
  console.log(groups);
//////////////

    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    var photos = data.Contents.map(function(photo) {
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);

      return getHtml([
        '<span>',
          '<div>',
            '<br/>',
            '<img style="width:512px;height:512px;" src="' + photoUrl + '"/>',
          '</div>',
          '<div>',
            '<span>',
              photoKey.replace('', ''),
            '</span>',
          '</div>',
        '</span>',
      ]);
    });
    var message = photos.length ?
      '<p>The following photos are present.</p>' :
      '<p>There are no photos in this album.</p>';
    var htmlTemplate = [
      '<div>',
        '<button onclick="listAlbums()">',
          'Back To Albums',
        '</button>',
      '</div>',
      '<h2>',
        'Album: ' + albumName,
      '</h2>',
      message,
      '<div>',
        getHtml(photos),
      '</div>',
      '<h2>',
        'End of Album: ' + albumName,
      '</h2>',
      '<div>',
        '<button onclick="listAlbums()">',
          'Back To Albums',
        '</button>',
      '</div>',
    ]
    document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
    document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');
  });
}
listAlbums();
// snippet-end:[s3.JavaScript.s3_PhotoViewer.viewAlbum]
// snippet-end:[s3.JavaScript.s3_PhotoViewer.complete]