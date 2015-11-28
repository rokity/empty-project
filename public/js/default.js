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
    $("#progress_bar").toggleClass('hidden');
    if ($("#head").children().length == 0) {
      $("#progress_bar").children(0).children(0).css("width",
        "100%").attr('aria-valuenow', '100').parent(0).fadeOut(
        1000);
      $("#search_row").fadeIn(100).children(0).css("padding-top",
        "1cm");
      $("#head").toggleClass('hidden').append($("#search_row"));
    } else {
      console.log("ELSE");
      $("#results").slideDown().toggleClass('hidden').promise().done(
        function() {
          $(this).children(0).children().remove();
        });

      $("#progress_bar").toggleClass('hidden');

    }


    $.ajax({
      url: "/search/" + ($("#search_text").val())
    }).done(function(data) {

      $.each(data, function(i, item) {
        if (item["title"] != "") {
          var elem = "<tr>";
          $.each(item, function(i, item) {
            if ($.inArray(i, categories) != -1)
              elem += ("<td>" + item + "</td>");
          });
          elem += "</tr>";
          $("#results").children(0).append(elem);
        }
      });
      $("#results").toggleClass('hidden');

    });


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
