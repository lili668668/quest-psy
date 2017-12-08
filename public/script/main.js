$(function() {
    var start = Date.now();
    var highest = 24;
    var lowest = 3;
    var giftNum = 18;
    var checkPeople = $(".jumpPeople");
    if (checkPeople) {
        $(".jumpGift").text(giftNum);
        var jumpPeople = window.setInterval(function () {
            var num = parseInt($(".jumpPeople").text());
            var plus = Math.floor(Math.random() * 3) + 1;
            if (num < highest) {
                var sum = num + plus;
                while (sum > highest) {
                    plus = Math.floor(Math.random() * 3) + 1;
                    sum = num + plus;
                }
                $(".jumpPeople").text(sum);
                if ((giftNum - sum) >= lowest) {
                    $(".jumpGift").text((giftNum - sum))
                }
            }
        }, Math.floor(Math.random() * 3000) + 1000);
    }
    $("#part2").submit(function(event){
        if (checkPeople) {
            $("#people").val($(".jumpPeople").text());
        }
        $("#time").val(Date.now() - start);
        return;
    });
});
