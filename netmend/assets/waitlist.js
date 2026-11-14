// Waitlist / order request by email. Nothing is sent or stored by this page:
// it only opens the visitor's own email app with a pre-filled message.
document.querySelectorAll('form.waitlist').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var prod=f.dataset.product||'Netmend';
    var price=f.dataset.price||'';
    var name=(f.querySelector('[name=name]')||{}).value||'';
    var site=(f.querySelector('[name=site]')||{}).value||'';
    var reserve=f.querySelector('[name=reserve]');
    var news=f.querySelector('[name=news]');
    if(reserve && !reserve.checked){alert('Please tick the first box to reserve the launch price.');return;}
    var body='Hi Netmend,\n\nProduct: '+prod+'\nName or business: '+name+(site?'\nWebsite: '+site:'')+
      '\n\nI want to reserve the launch price ('+price+'), with no payment and no obligation to buy.'+
      (news&&news.checked?'\nI agree to receive one email when it launches (and one if the launch is delayed).':'\nPlease reply only about my request (no launch email).')+
      '\n\nThanks';
    var subj=f.dataset.subject||('Netmend - '+prod+' - launch price');
    window.location.href='mailto:dayinportugal@gmail.com?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
  });
});
