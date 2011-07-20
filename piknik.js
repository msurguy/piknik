$(function() {
    
    var locked = false;
    
    var h = Math.random(),
        s = 0.6,//Math.random(),
        l = 0.5,
        width = $('body').width(),
        height = $('body').height();
    
    var hsl2rgb = function(h, s, l) {        
        var r = l,
            g = l,
            b = l,
            v = (l <= 0.5) ? (l * (s + 1)) : ((l + s) - (l * s));
        if (v > 0) {
            var m, sv, sextant, fract, vsf, mid1, mid2;
            m = l + l - v;
            sv = (v - m ) / v;
            h = h * 6;
            sextant = Math.floor(h);
            fract = h - sextant;
            vsf = v * sv * fract;
            mid1 = m + vsf;
            mid2 = v - vsf;
            switch (sextant) {
                case 0:
                case 6:
                    r = v;
                    g = mid1;
                    b = m;
                    break;
                case 1:
                    r = mid2;
                    g = v;
                    b = m;
                    break;
                case 2:
                    r = m;
                    g = v;
                    b = mid1;
                    break;
                case 3:
                    r = m;
                    g = mid2;
                    b = v;
                    break;
                case 4:
                    r = mid1;
                    g = m;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = m;
                    b = mid2;
                    break;
            }
        }
        
        r = Math.floor(r*255).toString(16);
        g = Math.floor(g*255).toString(16);
        b = Math.floor(b*255).toString(16);
        
        return '#' + (r.length == 1 ? '0' : '') + r + (g.length == 1 ? '0' : '') + g + (b.length == 1 ? '0' : '') + b;
    };
    
    var updateColor = function() {
        $('body').css('background-color', hsl2rgb(h, s, l));
    };
    
    var changeHS = function(x, y) {
        if (locked) {
            return;
        }
        h = x / width;
        s = 1 - (y / height);
        updateColor();
    };
    
    var changeL = function(delta) {
        if (locked) {
            return;
        }
        l += delta / 100;
        if (l > 1) {
            l = 1;
        }
        if (l < 0) {
            l = 0;
        }
        updateColor();
    };
    
    var toggleLock = function() {
        locked = ! locked;
        console.log('toggle lock');
    };
    
    if ('ontouchstart' in document.createElement('div')) {
        
        var getXY = function(evt) {
            if (evt.originalEvent.touches && evt.originalEvent.touches.length) {
                return [evt.originalEvent.touches[0].clientX, evt.originalEvent.touches[0].clientY];
            } else {
                return [evt.originalEvent.clientX, evt.originalEvent.clientY];
            }
        };
        
        var origPos = [Math.floor(h * width), Math.floor(l * height)];
        
        $('body').bind('touchstart', function(evt) {
            var startPos = getXY(evt),
                currentPos = startPos,
                moved = false,
                deltaX = 0,
                deltaY = 0,
                prevDeltaY = 0;
            evt.preventDefault();
            
            $('body').bind('touchmove', function(evt) {
                evt.preventDefault();
                currentPos = getXY(evt);
                deltaX = startPos[0] - currentPos[0];
                deltaY = startPos[1] - currentPos[1];
                if (! moved) {
                    var delta = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
                    if (delta > 10) {
                        moved = true;
                    }
                }
                
                if (moved && ! locked) {
                    if (evt.originalEvent.touches && evt.originalEvent.touches.length > 1) {
                        changeL(prevDeltaY > deltaY ? -1 : 1);
                        prevDeltaY = deltaY;
                    } else {
                        var newH = origPos[0] - deltaX;
                        while (newH < 0) {
                            newH += width;
                        }
                        while (newH > width) {
                            newH -= width;
                        }
                        
                        var newS = origPos[1] - deltaY;
                        if (newS < 0) {
                            newS = 0;
                        }
                        if (newS > height) {
                            newS = height;
                        }
                        
                        changeHS(newH, newS);
                    }
                }
            });
            
            $('body').bind('touchend', function() {
                if (! moved) {
                    toggleLock();
                } else {
                    origPos = [origPos[0] - deltaX, origPos[1] - deltaY];
                }
                $('body').unbind('touchmove');
                $('body').unbind('touchend');
            });
        });
        
    } else {
        
        $('body').bind('mousewheel', function(evt, delta) {
            changeL(delta);
        });
        $('body').bind('mousemove', function(evt) {
            changeHS(evt.clientX, evt.clientY);
        });
        $('body').bind('click', toggleLock);
        
    }
    
    updateColor();
    
});