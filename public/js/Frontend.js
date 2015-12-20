$(function() {

  $('.dropdown').on('show.bs.dropdown', function() {
    $(this).find(".dropdown-menu").slideDown('slow');
  });
  $('.dropdown').on('hide.bs.dropdown', function() {
    $(this).find(".dropdown-menu").slideUp('slow');
  });

  //press search
  $("#search").click(function(event) {
    var categories = ["title", "category", "seeds", "size"];
    //$("#progress_bar").toggleClass('hidden');
    if ($("#head").children().length == 0) {
      $("#progress_bar").toggleClass('hidden');
      $("#progress_bar").children(0).children(0).css("width",
        "100%").attr('aria-valuenow', '100').parent(0).fadeOut(
        1000).promise().done(function() {
        $(this).children(0).css("width",
          "0%").attr('aria-valuenow', '0');
      });


      $("#search_row").fadeIn(100).children(0).css("padding-top",
        "1cm");
      $("#head").toggleClass('hidden').append($("#search_row"));
    } else {

      $("#results").slideDown().toggleClass('hidden').promise().done(
        function() {
          $(this).children(0).children().remove();
        });
      $("#progress_bar").toggleClass('hidden');

      $("#progress_bar").children(0).children(0).css("width",
        "100%").attr('aria-valuenow', '100').parent(0).fadeOut(
        1000).promise().done(function() {
        $(this).children(0).css("width",
          "0%").attr('aria-valuenow', '0');
      });



    }


    $.ajax({
      url: "/search/" + ($("#search_text").val())
    }).done(function(data) {

      $.each(data, function(i, item) {
        if (item["hash"] != null) {
          var elem = "<tr onClick=\"download('" + item["hash"] +
            "')\">";


          $.each(item, function(i, item) {
            if ($.inArray(i, categories) != -1)
              elem += ("<td>" + item + "</td>");
          });
          elem += "</tr>";
          $("#results").children(0).append(
            elem);
        }
      });
      $("#results").toggleClass('hidden');

    });

    $("#search_text").focus();

  });

});
//press enter
$(document).keypress(function(e) {
  if (e.which == 13) {
    $("#search").trigger('click');
  } else {
    $("#search_text").focus();
  }
});

function download(hash) {
  console.log("download");
  $.ajax({
      url: '/download/' + hash,
    })
    .done(function() {
      var n = noty({
        layout: 'top',
        theme: 'relax', // or 'relax'
        type: 'success',
        text: 'The torrent was started', // can be html or string
        dismissQueue: true, // If you want to use queue feature set this true
        animation: {
          open: {
            height: 'toggle'
          }, // or Animate.css class names like: 'animated bounceInLeft'
          close: {
            height: 'toggle'
          }, // or Animate.css class names like: 'animated bounceOutLeft'
          easing: 'swing',
          speed: 500 // opening & closing animation speed
        },
        timeout: false, // delay for closing event. Set false for sticky notifications
        force: true, // adds notification to the beginning of queue when set to true
        modal: false,
        maxVisible: 5, // you can set max visible notification for dismissQueue true option,
        killer: true, // for close all notifications before show
        closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
        callback: {
          onShow: function() {},
          afterShow: function() {
            setTimeout(function() {
              n.close();
            }, 2000);
          },
          onClose: function() {},
          afterClose: function() {},
          onCloseClick: function() {},
        },
        buttons: false // an array of buttons
      });


    });
}
