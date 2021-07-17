/*========================================================================================
 ���� jsgmod.js (JavaScript Game MODule) ����
 
 �t���[���Ǘ���L�[���͓����x�����郂�W���[���ł��B
==========================================================================================
/*----------------------------------------------------------------------------------------
 ���� �萔�ꗗ ����
----------------------------------------------------------------------------------------*/
var FPS = 30;            // Frames Per Second; 1 �b�Ԃ̃t���[����
var LOOP_INTERVAL = 17;  // <�~���b> ���C�����[�v�N���Ԋu�B(1000 / <FPS>) ��菬��������
var KEY_CHARGE_DURATION = 7;  // <�t���[��> �L�[���s�[�g�J�n�܂ł̃t���[����
var KEY_REPEAT_SPAN = 2;      // <�t���[��> ���̃L�[���s�[�g�܂ł̃t���[����
/*
�� �L�[���s�[�g
 �L�[������������ƃL�[���A���œ��͂���邱�Ƃ��u�L�[���s�[�g�v�Ƃ����܂��B���Ƃ���
 KEY_CHARGE_DURATION = 20, KEY_REPEAT_SPAN = 4 �Ƃ���΁A�L�[�������n�߂��t���[���ƁA����
 ���琔���� 20, 24, 28, 32, �c �t���[���̊ԉ����������Ƃ��ɓ��͂𑗂�( IsInputting �� true
 ��Ԃ�)�悤�ɂȂ�܂��B
*/
/*----------------------------------------------------------------------------------------
 ���� �g���� ����

 Javascript �Ńt���[��������s�����W���[���ł��B�{���W���[���̓ǂݍ��݌��� Setup() (�N����
 �� 1 �񂾂���������鏉��������)�� Main() (���t���[�����s����鏈��)���`���Ă��������B
 �܂��Abody �^�O�� onLoad �C�x���g���� Execute() ���Ăяo���Ă��������B

�� HTML �t�@�C���̃\�[�X�̗�
 <html>
  <head>
   <script type="text/javascript" src="jsgmod.js"></script>
   <script type="text/javascript" src="my_sccript.js"></script>
  </head>
  <body onLoad="Execute()">
   �{��
  </body>
 </html>

------------------------------------------------------------------------------------------
�� �L�[����
 PressedDuration(keyName)         �L�[�����t���[��������Ă��邩
 IsPressed(keyName)               �L�[�͓��͊J�n���?
 IsHolded(keyName)                �L�[��������Ă���?
 IsInputting(keyName)             �L�[�͓��͂�^���Ă���?

�� �X�N���v�g�쐬�E�f�o�b�O
 p(value, variableName)             �R���\�[���ɕ\��
 InitArg(variable, defaultValue)    ��`�ς̒l���f�t�H���g�l���擾

�� �\��
 Say(textBoxName, text)           �e�L�X�g�̕\��
 SetImage(imageId, src)           �摜�̕\��

�� ����
 EHour()                          �o�ߎ��Ԃ́u���ԁv���擾
 EMin()                           �o�ߎ��Ԃ́u���v���擾
 ESec()                           �o�ߎ��Ԃ́u�b�v���擾
 EMSec()                          �o�ߎ��Ԃ́u�~���b�v���擾
 ETime()                          �o�ߎ��Ԃ���b���Ŏ擾
 EtStr(hLength=2, hDelim=':', mDelim=':', sDelim='', msLength=0)
                                  �o�ߎ��Ԃ𕶎���ɕϊ����Ď擾

�� ���l����
 Round(n, place=0)                �����_�̎w��ʂŎl�̌ܓ�
 Floor(n, place=0)                �����_�̎w��ʂŐ؂�̂�
 Ceil(n, place=0)                 �����_�̎w��ʂŐ؂�グ
 Justify(n)                       �ۂߌ덷�̏C��
 Rand(n=0, times=0)               �����̐���

�� �N�b�L�[
 Save(name, value, expireDays)    �N�b�L�[�փZ�[�u
 Load(name)                       �N�b�L�[���烍�[�h

�� �N��
 Execute()                        �N��( body �^�O�� onLoad �C�x���g����Ăяo���Ă�������)

�� �I�u�W�F�N�g
 Layer                            ���C���[
   Show()                           �\��
   Hide()                           �B��
   MoveTo(x, y)                     �w��ʒu�Ɉړ�
   MoveBy(dX, dY)                   �w��ʂ����ړ�
   ResizeTo(width, height)          �T�C�Y�ύX
   ResizeBy(dWidth, dHeight)        ���Βl���w�肵�ăT�C�Y�ύX
   Write(text, overwrites=true)     �e�L�X�g( HTML �\�[�X)�̋L��

========================================================================================*/
/*----------------------------------------------------------------------------------------
 ���� �O���[�o���ϐ��ꗗ ����

 �֋X��S���J�ϐ��ƂȂ��Ă��܂����A���̃��W���[���O����͒l��ύX���Ȃ��ł��������B
----------------------------------------------------------------------------------------*/
var gTimer;         // ���C�����[�v�̐���p�^�C�}�[
var gStartTime;     // �J�n����
var gFrames;        // �o�߃t���[����
var gInputs;        // [�`255] �e�L�[�����������Ă���t���[����
var gConsole;       // �R���\�[���E�B���h�E
/*----------------------------------------------------------------------------------------
 ���� �L�[�������̏��� ����
----------------------------------------------------------------------------------------*/
document.onkeydown = function(e){
  // Mozilla, Opera
  if(e != null){
    keyCode = e.which;
    // �C�x���g���s��h��
    e.preventDefault();
    e.stopPropagation();
  // Internet Explorer
  } else {
    keyCode = event.keyCode;
    // �C�x���g���s��h��
    event.returnValue = false;
    event.cancelBubble = true;
  }
  //�u�L�[�������n�߂��v���Ƃ̔��f
  if(gInputs[keyCode] <= 0) gInputs[keyCode] = 0;
}
/*----------------------------------------------------------------------------------------
 ���� �L�[�𗣂������̏��� ����
----------------------------------------------------------------------------------------*/
document.onkeyup = function(e){
  // Mozilla, Opera
  if(e != null){
    keyCode = e.which;
    // �C�x���g���s��h��
    e.preventDefault();
    e.stopPropagation();
  // Internet Explorer
  } else {
    keyCode = event.keyCode;
    // �C�x���g���s��h��
    event.returnValue = false;
    event.cancelBubble = true;
  }
  //�u�L�[�𗣂����v���Ƃ̔��f
  gInputs[keyCode] = -1;
}
/*----------------------------------------------------------------------------------------
 ���� �E�B���h�E���t�H�[�J�X�����������̏��� ����

 �L�[���͂��������܂�( onkeyup �C�x���g���������Ȃ��Ȃ邽��)�B
----------------------------------------------------------------------------------------*/
window.onblur = function(){
  gInputs = []; for(var i = 0; i < 256; i++) gInputs.push(-1);
}
/*----------------------------------------------------------------------------------------
 ���� �L�[�����t���[��������Ă��邩 ����

 <keyName>�Ŏw�肵���L�[�����t���[�������ꑱ���Ă��邩��Ԃ��܂��B������ -1 �ɂȂ�A������
 �n�߂�ƍĂ� 0 ����J�E���g����܂��B
----------------------------------------------------------------------------------------*/
function PressedDuration(keyName){
  return gInputs[ToKc(keyName)];
}
/*----------------------------------------------------------------------------------------
 ���� �L�[�͓��͊J�n���? ����

 <keyName>�Ŏw�肵���L�[��������n�߂������擾���܂��B������n�߂��t���[�������� true ���
 ���܂��B<keyName>�ɕ��̐����w��(�ȗ���)����ƁA�ǂ̃L�[�ɂ��������܂��B
----------------------------------------------------------------------------------------*/
function IsPressed(keyName){
  keyName = InitArg(keyName, -1);
  if(keyName < 0){
    for(i = 0; i < gInputs.length; i++){
      if(gInputs[i] == 1) return true;
    }
    return false;
  }
  return gInputs[ToKc(keyName)] == 1;
}
/*----------------------------------------------------------------------------------------
 ���� �L�[��������Ă���? ����

 <keyName>�Ŏw�肵���L�[��������Ă��邩���擾���܂��B������Ă��痣���܂ł̊� true ��Ԃ�
 �܂��B<keyName>�ɕ��̐����w��(�ȗ���)����ƁA�ǂ̃L�[�ɂ��������܂��B
----------------------------------------------------------------------------------------*/
function IsHolded(keyName){
  keyName = InitArg(keyName, -1);
  if(keyName < 0){
    for(i = 0; i < gInputs.length; i++){
      if(gInputs[i] > 0) return true;
    }
    return false;
  }
  return gInputs[ToKc(keyName)] > 0;
}
/*----------------------------------------------------------------------------------------
 ���� �L�[�͓��͂�^���Ă���? ����

 <keyName>�Ŏw�肵���L�[�����͂�^���邩���擾���܂��B�L�[�������n�߂����ƃL�[���s�[�g�̍�
 ���ł���΁u���͂�^���Ă���v�ƌ��Ȃ���܂��B<keyName>�ɕ��̐����w��(�ȗ���)����ƁA�ǂ�
 �L�[�ɂ��������܂��B
----------------------------------------------------------------------------------------*/
function IsInputting(keyName){
  keyName = InitArg(keyName, -1);
  if(keyName < 0){
    for(i = 0; i < gInputs.length; i++){
      if(gInputs[i] == 1) return true;
      if((gInputs[i] - KEY_CHARGE_DURATION - 1) % KEY_REPEAT_SPAN == 0) return true;
    }
    return false;
  }
  var keyCode = ToKc(keyName);
  if(gInputs[keyCode] <= KEY_CHARGE_DURATION) return gInputs[keyCode] == 1;
  return (gInputs[keyCode] - KEY_CHARGE_DURATION - 1) % KEY_REPEAT_SPAN == 0;
}
/*----------------------------------------------------------------------------------------
 ���� ��������L�[�R�[�h�ɕϊ����� ( TO KeyCode ) ����

 <keyString>�Ŏw�肵���L�[�̃R�[�h��Ԃ��܂��B<keyString>�ɑΉ�����L�[���Ȃ��ꍇ�� 0 ���
 ���܂��B�����̃L�[�R�[�h������L�[(���Ƃ��ΐ����� '0' �̃L�[�R�[�h�� 48 �� 96 (�e���L�[))
 �̏ꍇ�́A��\���� 1 �̃R�[�h��Ԃ��܂��B
----------------------------------------------------------------------------------------*/
function ToKc(keyString){
  switch(keyString){
  case 'Break':      return   3; break;
  case 'BackSpace':  return   8; break;
  case 'Tab':        return   9; break;
  case 'Enter':      return  13; break;
  case 'Shift':      return  16; break;
  case 'Ctrl':       return  17; break;
  case 'Alt':        return  18; break;
  case 'Pause':      return  19; break;
  case 'Esc':        return  27; break;
  case 'Space':      return  32; break;
  case 'PageUp':     return  33; break;
  case 'PageDown':   return  34; break;
  case 'End':        return  35; break;
  case 'Home':       return  36; break;
  case 'Left':       return  37; break;
  case 'Up':         return  38; break;
  case 'Right':      return  39; break;
  case 'Down':       return  40; break;
  case 'Insert':     return  45; break;
  case 'Delete':     return  46; break;
  case '0':          return  48; break;
  case '1':          return  49; break;
  case '2':          return  50; break;
  case '3':          return  51; break;
  case '4':          return  52; break;
  case '5':          return  53; break;
  case '6':          return  54; break;
  case '7':          return  55; break;
  case '8':          return  56; break;
  case '9':          return  57; break;
  case 'A':          return  65; break;
  case 'B':          return  66; break;
  case 'C':          return  67; break;
  case 'D':          return  68; break;
  case 'E':          return  69; break;
  case 'F':          return  70; break;
  case 'G':          return  71; break;
  case 'H':          return  72; break;
  case 'I':          return  73; break;
  case 'J':          return  74; break;
  case 'K':          return  75; break;
  case 'L':          return  76; break;
  case 'M':          return  77; break;
  case 'N':          return  78; break;
  case 'O':          return  79; break;
  case 'P':          return  80; break;
  case 'Q':          return  81; break;
  case 'R':          return  82; break;
  case 'S':          return  83; break;
  case 'T':          return  84; break;
  case 'U':          return  85; break;
  case 'V':          return  86; break;
  case 'W':          return  87; break;
  case 'X':          return  88; break;
  case 'Y':          return  89; break;
  case 'Z':          return  90; break;
  case 'Windows':    return  91; break;
  case 'Menu':       return  93; break;
  case '*':          return 106; break;
  case '+':          return 107; break;
  case 'F1':         return 112; break;
  case 'F2':         return 113; break;
  case 'F3':         return 114; break;
  case 'F4':         return 115; break;
  case 'F5':         return 116; break;
  case 'F6':         return 117; break;
  case 'F7':         return 118; break;
  case 'F8':         return 119; break;
  case 'F9':         return 120; break;
  case 'F10':        return 121; break;
  case 'F11':        return 122; break;
  case 'F12':        return 123; break;
  case 'NumLock':    return 144; break;
  case 'ScrollLock': return 145; break;
  case ':':          return 186; break;
  case ';':          return 187; break;
  case ',':          return 188; break;
  case '-':          return 189; break;
  case '.':          return 190; break;
  case '/':          return 191; break;
  case '@':          return 192; break;
  case '[':          return 219; break;
  case '\\':         return 220; break;
  case ']':          return 221; break;
  case '^':          return 222; break;
  default:           return   0; break;
  }
}
/*----------------------------------------------------------------------------------------
 ���� �R���\�[���ɕ\�� ����

 �R���\�[����<value>�̓��e��\�����܂��B<variableName>�ɕϐ����𕶎���Ŏw�肷��ƁA�ϐ���
 ����������邽�߂�茩�₷���Ȃ�܂��B

 var a = [1, 2, 3];
 p(a);       // => 1,2,3
 p(a, "a");  // => <a> = 1,2,3
----------------------------------------------------------------------------------------*/
function p(value, variableName){
  // �R���\�[�����J���Ă��Ȃ��ꍇ�͊J��
  if(typeof gConsole === 'undefined') openConsole();
  else if(gConsole.closed) openConsole();
  // ������̕ϊ�
  value = "" + value;  // ������
  value = value.replace(/</g, '&lt;');
  value = value.replace(/>/g, '&gt;');
  if(typeof variableName !== 'undefined'){
    variableName = "" + variableName;  // ������
    variableName = variableName.replace(/</g, '&lt;');
    variableName = variableName.replace(/>/g, '&gt;');
  }
  // �R���\�[���ɕ\��
  if(typeof variableName !== 'undefined'){
    gConsole.document.write('&lt;' + variableName + '&gt; = ');
  }
  gConsole.document.write(value + '<br>');
  // �ŉ��[�փX�N���[��
  gConsole.scroll(0, 16777215);
}
/*----------------------------------------------------------------------------------------
 ���� �R���\�[���E�B���h�E�̊J�n ����

 �R���\�[���E�B���h�E���J���܂��Bp ���ŕK�v�ɉ����Ď����I�ɊJ����܂��B
----------------------------------------------------------------------------------------*/
function openConsole(){
  var cwOptions = 'width=480, height=160, menubar=no, toolbar=no, scrollbars=yes';
  var cwStyle = '<span style="font-size:8pt;font-family:�l�r �S�V�b�N,monospace">';
  gConsole = window.open('about:blank', 'console', cwOptions);
  gConsole.document.write(cwStyle);
}
/*----------------------------------------------------------------------------------------
 ���� ��`�ς̒l���f�t�H���g�l���擾 ( INITialize ARGument ) ����

 <variable>�ɒl����`����Ă��Ȃ��ꍇ�̓f�t�H���g�l�Ƃ���<defaultValue>��Ԃ��܂��B
----------------------------------------------------------------------------------------*/
function InitArg(variable, defaultValue){
  return (typeof variable === 'undefined') ? defaultValue : variable;
}
/*----------------------------------------------------------------------------------------
 ���� �e�L�X�g�̕\�� ����

 <textBoxId>�Ŏw�肵�� ID �̃e�L�X�g�{�b�N�X�ɕ���<text>��\�����܂��B
----------------------------------------------------------------------------------------*/
function Say(textBoxId, text){
  document.getElementById(textBoxId).value = text;
}
/*----------------------------------------------------------------------------------------
 ���� �摜�̕\�� ����

 <imageId>�Ŏw�肵���摜�̃A�h���X��<src>�ɂ��܂��B�A�h���X���ς��Ȃ���Ή������܂���B
----------------------------------------------------------------------------------------*/
function SetImage(imageId, src){
  if(document.getElementById(imageId).src != src){
    document.getElementById(imageId).src = src;
  }
}
/*----------------------------------------------------------------------------------------
 ���� �o�ߎ��Ԃ̎w�肳�ꂽ�������擾 ( Elapsed HOURs/MINutes/SEConds/MilliSEConds ) ����

 �N������̌o�ߎ��Ԃ̂����A����/��/�b/�~���b �̕����̒l��Ԃ��܂��B�o�ߎ��Ԃ͌o�߃t���[����
 ����v�Z�����l�ł��̂ŁA���ۂ̎��Ԃɑ΂��đ����̌덷������܂��B

 �� �N������ 1 ���� 23 �� 45.678 �b���o�߂����ꍇ
 p(EHour());  // => 1
 p(EMin());   // => 23
 p(ESec());   // => 45
 p(EMSec());  // => 678
----------------------------------------------------------------------------------------*/
function EHour(){return Math.floor(gFrames / FPS / 3600); }
function EMin() {return Math.floor(gFrames / FPS / 60) % 60; }
function ESec() {return Math.floor(gFrames / FPS) % 60; }
function EMSec(){return Math.floor(gFrames / FPS * 1000) % 1000; }
/*----------------------------------------------------------------------------------------
 ���� �o�ߎ��Ԃ�b���Ŏ擾 ( Elapsed TIME ) ����

 �N������̌o�ߎ��Ԃ�b�P�ʂŕԂ��܂��B�����_�������Ԃ���܂��BEHour() ���Ɠ��l�ɁA���ۂ�
 ���Ԃɑ΂��đ����̌덷������܂��B
----------------------------------------------------------------------------------------*/
function ETime(){
  return gFrames / FPS;
}
/*----------------------------------------------------------------------------------------
 ���� �o�ߎ��Ԃ𕶎���ɕϊ����Ď擾 ( Elapsed Time STRing ) ����

 �N������̌o�ߎ��Ԃ���ʓI�Ȏ��ԕ\���ŕԂ��܂��BEHour() ���Ɠ��l�ɁA���ۂ̎��Ԃɑ΂��đ�
 ���̌덷������܂��B

 �� �N������ 1 ���� 23 �� 45 �b���o�߂����ꍇ
 p(EtStr());  // => '01:23:45'
------------------------------------------------------------------------------------------
 <hLength>(�ȗ��� 2 )�Ŏ��Ԃ̌������w�肵�܂��B���̌����ɑ���Ȃ���΁A�󂢂������� 0 ��
 ���߂܂��B������葽���ꍇ�́A���Ԃ̕����͂��̂܂܂ɂ��܂��B

 �� �N������ 10 ���Ԃ��o�߂����ꍇ
 p(EtStr(4));  // => '0010:00:00'
 p(EtStr(3));  // => '010:00:00'
 p(EtStr(2));  // => '10:00:00'
 p(EtStr(1));  // => '10:00:00'
------------------------------------------------------------------------------------------
 <hDelim>(�ȗ��� ':' ), <mDelim>(�ȗ��� ':' ), <sDelim>(�ȗ��� '' )�͂��ꂼ�ꎞ�ԁA���A�b
 �̋�؂�L��( Hour/Minute/Second DELIMiter )�ł��B

 �� �N������ 1 ���� 23 �� 45 �b���o�߂����ꍇ
 p(EtStr(1, '����', '��', '�b'));  // => '1����23��45�b'
------------------------------------------------------------------------------------------
 <msLength>(�ȗ��� 0 )�ŕb�������_���ʂ܂ŕ�����ɂ��邩���w��ł��܂��B

 �� �N������ 1 ���� 23 �� 45.666 �b���o�߂����ꍇ
 p(EtStr(undefined, undefined, undefined, undefined, 0));  // => '01:23:45'
 p(EtStr(undefined, undefined, undefined, '.', 1));        // => '01:23:45.6'
 p(EtStr(undefined, undefined, undefined, '.', 2));        // => '01:23:45.66'
 p(EtStr(undefined, undefined, undefined, '.', 3));        // => '01:23:45.666'
----------------------------------------------------------------------------------------*/
function EtStr(hLength, hDelim, mDelim, sDelim, msLength){
  hLength = InitArg(hLength, 2);
  hDelim = InitArg(hDelim, ':');
  mDelim = InitArg(mDelim, ':');
  sDelim = InitArg(sDelim, '');
  msLength = InitArg(msLength, 0);

  var result = '';
  for(var i = hLength - 1; i >= 1; i--){
    if(EHour() < Math.pow(10, i)) result += '0'
  }
  result += EHour() + hDelim;
  result += ('0' + EMin()).slice(-2) + mDelim;
  result += ('0' + ESec()).slice(-2) + sDelim;
  result += (('00' + EMSec()).slice(-3)).slice(0, msLength);
  return result;
}
/*----------------------------------------------------------------------------------------
 ���� �����_�̎w��ʂŎl�̌ܓ�/�؂�̂�/�؂�グ ����

 ���l<n>���l�̌ܓ�/�؂�̂�/�؂�グ���܂��B
------------------------------------------------------------------------------------------
 <place>�� 0 (�ȗ���)�Ȃ琮���ɂȂ�悤�ɁA���̐��Ȃ珬���_�ȉ���<place>���ɂȂ�悤�ɏ���
 ���܂��B���̐����w�肷��� -<place>���ڂ̐����������������܂��B

 p(Round(1234.5678))      // => 1235
 p(Round(1234.5678, 2))   // => 1234.57
 p(Round(1234.5678, -2))  // => 1200
------------------------------------------------------------------------------------------
 �ۂߌ덷�� Justify �ɂ���Ď����C������܂��B
----------------------------------------------------------------------------------------*/
function Round(n, place){
  place = InitArg(place, 0);
  return Justify(Math.round(n * Math.pow(10, place)) / Math.pow(10, place));
}
//----------------------------------------------------------------------------------------
function Floor(n, place){
  place = InitArg(place, 0);
  return Justify(Math.floor(n * Math.pow(10, place)) / Math.pow(10, place));
}
//----------------------------------------------------------------------------------------
function Ceil(n, place){
  place = InitArg(place, 0);
  return Justify(Math.ceil(n * Math.pow(10, place)) / Math.pow(10, place));
}
/*----------------------------------------------------------------------------------------
 ���� �ۂߌ덷�̏C�� ����

 <n>�̊ۂߌ덷���C�����ĕԂ��܂��B�ۂߌ덷�Ƃ́A�R���s���[�^���������v�Z����Ɛ����������
 �덷�̂��Ƃł��B

 p(0.01 + 0.05);           // => 0.060000000000000005
 p(Justify(0.01 + 0.05));  // => 0.06
------------------------------------------------------------------------------------------
 ��̓I�ɂ́A�L�������� 15 ���ɂȂ�悤�Ɏl�̌ܓ����Ă��܂��B���Ƃ��ƗL�������� 16 ���ȏ�
 �̏ꍇ�A�Ӑ}���Ȃ��l�̕ω����N����\��������܂��B
----------------------------------------------------------------------------------------*/
function Justify(n){
  // ���傤�� 0 �Ȃ炻�̂܂ܕԂ�( log(0) ����`����Ă��Ȃ�����)
  if(n == 0) return 0;
  // ���̐��ɕϊ�
  var pn = Math.abs(n);
  // 15 ���̐����ɕ␳
  var cl = Math.floor(Math.log(pn) / Math.LN10);  // Common Logarithm
  pn = Math.round(pn * Math.pow(10, 14 - cl));
  // ������
  var result = "" + pn;
  var zeros = "";
  // �K�؂Ȉʒu�ɏ����_��t��
  if(0 <= cl && cl <= 14){
    result = result.slice(0, cl + 1) + "." + result.slice(cl + 1);
  }else if(cl < 0){
    // �擪�Ɂu0.000�c�v��t��
    for(var i = 0; i < Math.abs(cl) - 1; i++) zeros += "0";
    result = "0." + zeros + result;
  }else{
    // �Ō���Ɂu000�c�v��t��
    for(var i = 15; i < cl; i++) zeros += "0";
    result = result + zeros;
  }
  // �Ăѐ��l�ɖ߂��ĕԂ�
  return parseFloat(result) * (n > 0 ? 1 : -1);
}
/*----------------------------------------------------------------------------------------
 ���� ����( RANDom number )�̐��� ����

 0 �ȏ�<n>�����̗����𐮐��ŕԂ��܂��B<n>�� 0 (�ȗ���)���w�肳�ꂽ�ꍇ�́A0 �ȏ� 1 ������
 �����������ŕԂ��܂��B
------------------------------------------------------------------------------------------
 <times>�� 1 �ȏ�̐������w�肵���ꍇ�́A�d���̂Ȃ��悤��<times>�̗����z����쐬���ĕԂ�
 �܂��B<times>��<n>���傫���ꍇ�́A�d�����Ȃ������z�񂪌J��Ԃ���������܂��B

 p(Rand(5, 2))   // => 4,2
 p(Rand(5, 5))   // => 2,0,3,1,4
 p(Rand(5, 15))  // => 1,2,0,3,4,2,1,0,4,3,0,1,4,3,2

 �� ���ʂ͌Ăяo����邲�Ƃɕς��܂��B
----------------------------------------------------------------------------------------*/
function Rand(n, times){
  n = InitArg(n, 0);
  times = InitArg(times, 0);

  if(times <= 0){
    // �l�ŕԂ�
    if(n <= 0) return Math.random();
    return Math.floor(Math.random() * n);
  }else{
    // �z��ŕԂ�
    var result = [];
    var sequence;
    var choice;
    while(true){
      sequence = [];
      // �A�Ԕz����쐬����
      for(var i = 0; i < n; i++) sequence.push(i);
      // �A�Ԕz�񂩂烉���_���Ŕ����o���Ă���
      for(var i = 0; i < n; i++){
        choice = Math.floor(Math.random() * sequence.length);
        result.push(sequence[choice]);
        // �K�v���ɂȂ�����I��
        if(result.length == times) return result;
        // �����o�����v�f���폜
        sequence = sequence.slice(0, choice).concat(sequence.slice(choice + 1));
      }
    }
  }
}
/*----------------------------------------------------------------------------------------
 ���� �N�b�L�[�փZ�[�u ����

 �N�b�L�[( Cookie )�ɏ����������݂܂��B<name>�ɖ��O�A<value>�ɒl�A<expireDays>�ɗL������
 �܂ł̓���(�ȗ��� 7305 (�� 20 �N��))�����ꂼ��w�肵�܂��B�������ރf�[�^��
 �u���O=�l; expires=�L������;�v�̂悤�ȏ����ɂȂ�܂��B
------------------------------------------------------------------------------------------
 �u���E�U�ŃN�b�L�[�̊�����g�p�֎~���w�肳��Ă���ꍇ�́A�����炪�D�悳���Ǝv���܂��B
----------------------------------------------------------------------------------------*/
function Save(name, value, expireDays){
  expireDays = InitArg(expireDays, 7305);

  // �ۑ��p������̍쐬
  var s = encodeURIComponent(name) + "="
  s += encodeURIComponent(value) + "; expires=";
  // �L�������̐ݒ�
  var xpDate = new Date().getTime();  // eXPire DATE
  xpDate -= 60000 * new Date().getTimezoneOffset();
  xpDate += expireDays * 86400000;
  s += new Date(xpDate).toUTCString();
  // �ۑ�
  document.cookie = s;
}
/*----------------------------------------------------------------------------------------
 ���� �N�b�L�[���烍�[�h ����

 �N�b�L�[��ǂݍ���ŁA���O<name>�ɑΉ�����l��Ԃ��܂��B�w�肵�����O�����݂��Ȃ��ꍇ��
 <defaultValue>���Ԃ�܂��B
----------------------------------------------------------------------------------------*/
function Load(name, defaultValue){
  var cookieStr = document.cookie;  // COOKIE STRing
  var namePos = cookieStr.indexOf(name);  // NAME POSition
  if(namePos == -1) return defaultValue;

  var si = namePos + name.length + 1;   // Start Index
  var ei = cookieStr.indexOf(';', si);  // End Index
  ei = (ei == -1) ? cookieStr.length : ei;
  return decodeURIComponent(cookieStr.substring(si, ei));
}
/*----------------------------------------------------------------------------------------
 ���� ���C�����[�v ����

 1 �t���[���ɑ������鎞��( 1 / <FPS> �b)���o�߂�����A�t���[�����������s���܂��B�������Ɗ�
 �荞��(�L�[���͓�)�ȊO�͌����Ƃ��Ă��̃��[�v���ŏ�������܂��B
----------------------------------------------------------------------------------------*/
function MainLoop(){
  // �t���[���o�ߔ���
  // setInterval �͐��x���Ⴂ�̂ŁA�t���[���o�ߔ����ʓr�s���Ď��ԊǗ������Ă��܂��B
  if(new Date() - gStartTime < 1000 / FPS * gFrames) return;
  gFrames++;
  // ������Ă���L�[�̊Ǘ�
  for(var i = 0; i < 256; i++) if(gInputs[i] >= 0) gInputs[i]++;
  // �t���[���������B�Ăяo�����Œ�`���Ă�������
  Main();
}
/*----------------------------------------------------------------------------------------
 ���� �I�������� ����

 �ʂ̃y�[�W�Ɉڂ�Ƃ���A����Ƃ��Ɏ����I�Ɏ��s����鏈���ł��B
----------------------------------------------------------------------------------------*/
window.onbeforeunload = function(){
  // �R���\�[�����J���Ă���Ε���
  if(typeof gConsole !== 'undefined') if(!gConsole.closed) gConsole.close();
}
/*----------------------------------------------------------------------------------------
 ���� �N�� ����

 �ŏ��ɌĂяo����܂��B�������ƃ��C�����[�v�̋N�����s���܂��B
----------------------------------------------------------------------------------------*/
function Execute(){
  // ���W���[�����̏���������
  gStartTime = new Date();
  gFrames = 0;
  gInputs = []; for(var i = 0; i < 256; i++) gInputs.push(-1);
  // �����������B�Ăяo�����Œ�`���Ă�������
  Setup();
  // �^�C�}�[�N��
  gTimer = setInterval('MainLoop()', LOOP_INTERVAL)
}
/*----------------------------------------------------------------------------------------
 ���� �I�u�W�F�N�g: ���C���[ ����

 div �^�O���Ŏw�肵���u���b�N�����C���[�Ƃ��Ĉ����܂��B���������A<id>�ɂ̓u���b�N�� id
 ���w�肵�Ă�������(<div id="my_layer"> �� my_layer �̕���)�B
----------------------------------------------------------------------------------------*/
function Layer(id){
  this.layer = document.getElementById(id);
  /*
  �����Ő�΍��W�w��ɂ��Ă��܂����A�ł������O�����ăX�^�C���V�[�g�Ő�΍��W�w��ɂ��Ă�
  �������B��: <div id="my_layer" style="position: absolute;"></div>
  */
  this.layer.style.position = "absolute";
}
/*----------------------------------------------------------------------------------------
 ���� �\�� ����
----------------------------------------------------------------------------------------*/
Layer.prototype.Show = function(){
  this.layer.style.visibility = "visible";
};
/*----------------------------------------------------------------------------------------
 ���� �B�� ����
----------------------------------------------------------------------------------------*/
Layer.prototype.Hide = function(){
  this.layer.style.visibility = "hidden";
};
/*----------------------------------------------------------------------------------------
 ���� �w��ʒu�Ɉړ� ����
----------------------------------------------------------------------------------------*/
Layer.prototype.MoveTo = function(x, y){
  this.layer.style.left = x;
  this.layer.style.top = y;
};
/*----------------------------------------------------------------------------------------
 ���� �w��ʂ����ړ� ����
----------------------------------------------------------------------------------------*/
Layer.prototype.MoveBy = function(dX, dY){
  this.layer.style.left = parseFloat(this.layer.style.left) + dX;
  this.layer.style.top = parseFloat(this.layer.style.top) + dY;
};
/*----------------------------------------------------------------------------------------
 ���� �T�C�Y�ύX ����
----------------------------------------------------------------------------------------*/
Layer.prototype.ResizeTo = function(width, height){
  this.layer.style.width = width;
  this.layer.style.height = height;
};
/*----------------------------------------------------------------------------------------
 ���� ���Βl���w�肵�ăT�C�Y�ύX ����
----------------------------------------------------------------------------------------*/
Layer.prototype.ResizeBy = function(dWidth, dHeight){
  this.layer.style.width = parseFloat(this.layer.style.width) + dWidth;
  this.layer.style.height = parseFloat(this.layer.style.height) + dHeight;
};
/*----------------------------------------------------------------------------------------
 ���� �e�L�X�g( HTML �\�[�X)�̋L�� ����

 ���C���[��<text>���L�����܂��B<overwrites>=true �Ȃ�Ώ㏑���Afalse �Ȃ�Βǉ����܂��B
----------------------------------------------------------------------------------------*/
Layer.prototype.Write = function(text, overwrites){
  overwrites = InitArg(overwrites, true);

  if(overwrites) this.layer.innerHTML = text;
  else this.layer.innerHTML += text;
};
