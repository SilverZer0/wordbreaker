function loadLevel(){
    var level = document.getElementById('levels').value;
    document.getElementById('textInput').value = levels[level]["text"];
    document.getElementById('gamemode').value = levels[level]["mode"];
}

var levels = {
level_0:{mode:"words",
text:`\
Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula \
eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, \
nascetur ridiculus mus.

Donec quam felis, ultricies nec, pellentesque eu, pretium quis, \
sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, \
vulputate eget, arcu.

In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. \
Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus \
elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, \
consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a,
`},

level_1:{mode:"letters",
text:`\
'The  quick  brown  fox  jumps  over  the  lazy  dog
The                            
quick                                    
brown                      
fox          
  jumps
               over
                            the
                                     lazy
                                                dog
The  quick  brown  fox  jumps  over  the  lazy  dog
                                                dog
                                     lazy
                          the
               over
  jumps
fox          
brown                      
quick                                    
The                                                
The  quick  brown  fox  jumps  over  the  lazy  dog'
`}
}