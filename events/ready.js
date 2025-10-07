module.exports = client => {

    client.user.setPresence({activity: {name: "Developed By AnılK", type: "PLAYING"}, status: "dnd"});

};

//---------------------------------------------------
//type: PLAYING, WATCHING !!!! Sağdaki değerler Oynuyor/İzliyor
//status: online, idle, dnd  !!!! Sırasıyla: Çevrimiçi, Boşta, Rahatsız Etmeyin
//Şuanda rahatsız etme modundadır bota hiçbir katkısı yok o yüzden 3 değeri istediğiniz gibi atayabilirisiniz
// Name kısmını istediğiniz gibi ayarlayabilirsiniz, Type/Status değerlerini yukarıdaki değerlerden başka girmeyin.
