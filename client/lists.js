   (function(){
    $(".frc-tab").show();
    $(".eng-tab").hide();
    $('.eng').on('click', function(event){
      $('.eng-tab').show();
      $('.frc-tab').hide();
    });
    $('.frc').on('click', function(event){
      $('.eng-tab').hide();
      $('.frc-tab').show();
    });
})();