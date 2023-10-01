
  $(document).ready(function() {
    $(".imageInput").change(function() {
      var input = this;
      var imagePreview = $(input).siblings('.rounded-image-preview').children('img')[0];

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
          imagePreview.src = e.target.result;
          $(imagePreview).show();
        };

        reader.readAsDataURL(input.files[0]);
      }
    });
  });

