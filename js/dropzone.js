$("#posterFile").change(function(input){
    var files = input.files ? input.files : input.currentTarget.files;
    if (files) {
        var reader = new FileReader();

        reader.onload = function (e) {
            console.log(e.target.result);
            document.getElementById('poster').style.backgroundImage =  "url('" + e.target.result + "')";
            document.getElementById('posterText').innerHTML = '';
        }

        reader.readAsDataURL(files[0]);
    }
})