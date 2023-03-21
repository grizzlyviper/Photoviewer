const albumBucketName = "pyscrapedd";

// **DO THIS**:
//   Replace this block of code with the sample code located at:
//   Cognito -- Manage Identity Pools -- [identity_pool_name] -- Sample Code -- JavaScript
//
// Initialize the Amazon Cognito credentials provider
AWS.config.region = "us-east-1"; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId:
    "us-east-1:2bd2d00c-7aa5-4035-aad3-7af924f85754",
});

// Create a new service object
const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: {Bucket: albumBucketName},
});

const regions = {
  "#northern": "NorthernMtns",
  "#central": "CentralMtns",
  "#southern": "SouthernMtns",
};

const makeGroups = contents => {
  const groups = {};

  contents.forEach(e => {
    const [_, key, name] = e.Key.split("/");
    const split = name
      .match(/-([-\d]+)\.(?:png|jpg|jpeg)$/)[1]
      .split("-");
    e.date = new Date(
      `${split.slice(0, 3).join("-")}T${split.slice(3).join(":")}`
    );
    e.displayName = key
      .split(/__|_-_/)
      .filter(Boolean)
      .map(e => e.replace(/[-_]/g, " "))
      .join(", ");

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(e);
  });

  return groups;
};

const render = region => {
  const albumName = regions[region];

  if (!albumName) {
    document.querySelector("#viewer").innerHTML =
      `<p>Region not found: ${region.slice(1)}</p>`;
    return;
  }

  document.getElementById("viewer").innerHTML =
    `<p>Loading cameras for the ${region.slice(1)} region...</p>`;

  s3.listObjects({Prefix: albumName}, function (err, data) {
    if (err) {
      console.error(err.message);
      document.querySelector("#viewer").textContent =
        `There was an error viewing your album: ${err.message}`;
      return;
    }

    // 'this' references the AWS.Request instance that represents the response
    const href = this.request.httpRequest.endpoint.href;

    const groups = makeGroups(data.Contents);

    for (const group in groups) {
      groups[group].sort((a, b) => b.date - a.date);
    }

    const photoHTML = Object.entries(groups).map(([groupName, group]) => {
      const photo = group[0];
      const bucketUrl = `${href}${albumBucketName}/`;
      const photoUrl = bucketUrl + photo.Key;
      const photoDate = photo.date.toString().slice(0, 25);
      const galleryHTML = group
        .slice(1)
        .map(e => `
          <a data-fslightbox="${groupName}"
              href="${bucketUrl + e.Key}"
              data-type="image"
           ></a>
        `)
        .join("");
      return `
      <div class="card">
        <div>
          <a data-fslightbox="${groupName}" href="${photoUrl}" data-type="image">
            <img alt="photo of a mountain" src="${photoUrl}">
          </a>
          ${galleryHTML}
        </div>
        <div>
          ${photo.displayName}
        </div>
        <div>
          <small>
            ${photoDate}
          </small>
        </div>
      </div>
    `;
    });

    const message = photoHTML.length
      ? `The following cameras are present for the ${region.slice(1)} region.`
      : `There are no photos for the ${region.slice(1)} region.`;
    const html = `
      <p>${message}</p>
      <div class="photo-container">${photoHTML.join("")}</div>
    `;
    document.getElementById("viewer").innerHTML = html;
    refreshFsLightbox();
  });
};

if (window.location.hash) {
  render(window.location.hash);
}

window.onhashchange = evt => render(window.location.hash);

