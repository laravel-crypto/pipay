Architekt.event.on('ready', function() {
	Architekt.module.Printer.setLevel(0);

	/* Common tasks */
	//Radio and check box label: on click, simulate click on input
	$('.pi-radio > label').click(function() {
		$(this).prev('input').trigger('click');
	});
	$('.pi-checkbox > label').click(function() {
		$(this).prev('input').trigger('click');
	});



	/* Main */
	var body = $('body');
    var howThisWorkLayer = $('#howThisWorkLayer');

    $('#howThisWork').click(function() {
        body.addClass('pi-modal');          //hide scrollbar
        $('#howThisWorkLayer').fadeIn(100);
    });

    $('#howThisWorkLayer').click(function() {
        body.removeClass('pi-modal');
        $('#howThisWorkLayer').fadeOut(100);
    });


    /* Tool */
	var _isSubmittingCreateProduct = false;
	var generated = false;
	var token = '';

	function generateCode(type, lan, token, orderId) {
		lan = lan.toLowerCase();

		var method = function() {};;

		switch(type) {
			case 'button':
				method = updateButton;
				break;
			case 'link':
				method = updateLink;
				break;
			default:
				throw new Error('unsupported type ' + type);
				break;
		}

		//update dom
		method.apply(null, [].slice.call(arguments, 1));	//slice first element
	}
	function updateButton(lan, token, orderId) {
		if(typeof token === 'undefined' || token === "") return;

		var buttonText = null;

		switch(lan) {
			case 'en':
				buttonText = 'Pay with PI';
				break;
			case 'ko':
				buttonText = '파이결제';
				break;
		}

		$('#pi_generated').val('<a href="#" class="pi-payment-button" data-token="' + token + '" data-lang="' + lan + '" data-btn="0" data-livemode="1" data-order-id="' + orderId + '"><img src="/image/pi-payment-logo.png" /><span>' + buttonText + '</span></a>');
	}
	function updateLink(lan, token, orderId) {
		if(typeof token === 'undefined' || token === "") return;
		$('#pi_generated').val(Architekt.module.Client.createUrl('/checkout/' + token + '?lang=' + lan + '&livemode=1&order_id=' + orderId));
	}

	//submit generate product
	$('#createProductForm').submit(function() {
		if(generated) return false;;
		if(_isSubmittingCreateProduct) return false;;

		var url = $(this).attr('action');
		var Notice = Architekt.module.Widget.Notice;
		var Validator = Architekt.module.Validator;

		//validations
		var itemDesc = $('#item_desc');
		var orderId = $('#order_id');
		var amount = $('#amount');
		var email = $('#email');
		var redirectUrl = $('#redirect');
		var ipn = $('#ipn');

		function _error(text, focus, reset) {
			new Notice({
				text: text,
				callback: function() {
					if(focus) focus.focus();
					if(reset) reset.val('');
				}
			});
		}

		/* check empty */
		if(!itemDesc.val()) {
			_error('상품명을 입력해주세요.', itemDesc);
			return false;
		}
		else if(!amount.val()) {
			_error('상품 가격을 입력해주세요.', amount);
			return false;
		}

		/* data format */
		if(itemDesc.val().length < 2) {
			_error('상품명은 2글자 이상으로 입력해주세요.', itemDesc);
			return false;
		}
		else if(!Validator.checkIfNotEmpty(orderId.val(), 'alphanumeric')) {
			_error('상품번호는 영문자와 숫자의 조합만 사용가능합니다.', orderId);
			return false;
		}
		else if(!Validator.is(amount.val(), 'numeric')) {
			_error('상품가격은 숫자로 입력해주세요.', amount);
			return false;
		}
		else if(!Validator.checkIfNotEmpty(email.val(), 'email')) {
			_error('이메일은 이메일 형식으로 입력해주세요!', email);
			return false;
		}
		else if(!Validator.checkIfNotEmpty(redirectUrl.val(), 'url')) {
			_error('결제 후 연결할 URL주소는 URL 형식으로 입력해주세요!', redirectUrl);
			return false;
		}
		else if(!Validator.checkIfNotEmpty(ipn.val(), 'url')) {
			_error('IPN은 URL 형식으로 입력해주세요!', ipn);
			return false;
		}


		_isSubmittingCreateProduct = true;

		//Send POST request
		Architekt.module.Http.post({
			url: url,
			data: {
				'item_desc': itemDesc.val(),
				'order_id': orderId.val(),
				amount: amount.val(),
				email: email.val(),
				redirect: redirectUrl.val(),
				ipn: ipn.val(),
			},
			success: function(data) {
				var cipher = data.crypt;

				token = cipher;

				generated = true;
				generateCode(window.generateType, 'ko', token, orderId.val());

				//scroll to bottom!
				$("html, body").animate({ scrollTop: $(document).height() }, "slow");
			},
			error: function(text, status) {
				new Notice({
					text: (text + status).join(", "),
				});
			},
			complete: function() {
				_isSubmittingCreateProduct = false;
			}
		});

		return false;
	});
	//change language
	$('.controlLan').click(function() {
		var lan = $(this).val();
		generateCode('button', lan, token);
	});
	//if user clicked "button", make radio click
	$('.pi-payment-button').click(function() {
		$(this).prev().trigger('click');
	});
	//copy button
	$('#codeCopy').click(function() {
		var generatedCode = $('#pi_generated');

		if(!generated || generated === "") return false;

		Architekt.module.Clipboard.copy($('#pi_generated'));

		new Architekt.module.Widget.Notice({
			text: '복사되었습니다.',
		});
	});
});