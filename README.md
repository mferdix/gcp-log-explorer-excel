<h1> Cara Pakai </h1>
<ul>
  <li>Ke Log Explorer di GCP</li>
  <li>Masukin Script Dibawah, Filter Tanggal/li>
  <li>logName:"cloudaudit.googleapis.com%2Factivity" <br>
      protoPayload.authenticationInfo.principalEmail != null <br>
      protoPayload.requestMetadata.callerIp != null <br>
      protoPayload.authenticationInfo.principalEmail:("@email.com")</li>
  <li>Download Querynya as CSV</li>
  <li>Upload to Web</li>
</ul>
