/*========================================================================================
 ���� data.js ����
========================================================================================*/
/*----------------------------------------------------------------------------------------
 ���� �萔�ꗗ ����
----------------------------------------------------------------------------------------*/
var MATRIX_WIDTH = 10;               // �}�g���b�N�X�̉��u���b�N��
var DEADLINE_HEIGHT = 3;             // �f�b�h���C���ȏ�Ńu���b�N�̏���ێ����鍂��
var MATRIX_HEIGHT = 23;              // �}�g���b�N�X�̏c�u���b�N���B�f�b�h���C���ȏ���܂�
var SOFT_DROP_SPAN = 1;              // <�t���[��> �\�t�g�h���b�v�� 1 �}�X�i�ނ܂ł̎���
var NATURAL_DROP_SPAN = 36;          // <�t���[��> ���R������ 1 �}�X�i�ނ܂ł̎���
var LINE_CLEAR_DURATION = 15;        // <�t���[��> ���C���������o�̎���
var DISPLAY_FEATURES_DURATION = 45;  // <�t���[��> ���������Z�̕\������
var NEXT_MINOS = 5;                  // �l�N�X�g�\����
var ROTATE_RULES = 5;                // ��]���[����
var HORIZONTAL_CHARGE_DURATION = 7;  // <�t���[��> �L�[�������n�߂Ă��牡�ړ����s�[�g�J�n�܂ł̎���
var HORIZONTAL_REPEAT_SPAN = 1;      // <�t���[��> ���ړ��̎��Ԋ��o

var INITIAL_DIR = 0;                  // �o�����̃~�m�̌���
var INITIAL_X = 3;                    // �o�����̃~�m�� X ���W
var INITIAL_Y = DEADLINE_HEIGHT - 2;  // �o�����̃~�m�� Y ���W

var DEFAULT_KEY_MOVE_LEFT    = 'Left';
var DEFAULT_KEY_MOVE_RIGHT   = 'Right';
var DEFAULT_KEY_SOFTDROP     = 'Down';
var DEFAULT_KEY_HARDDROP     = 'Space';
var DEFAULT_KEY_ROTATE_RIGHT = 'X';
var DEFAULT_KEY_ROTATE_LEFT  = 'Z';
/*
// ���Ȃ����̃L�[�z�u
var DEFAULT_KEY_MOVE_LEFT    = 'S';
var DEFAULT_KEY_MOVE_RIGHT   = 'F';
var DEFAULT_KEY_SOFTDROP     = 'C';
var DEFAULT_KEY_HARDDROP     = 'D';
var DEFAULT_KEY_ROTATE_RIGHT = 'L';
var DEFAULT_KEY_ROTATE_LEFT  = 'J';
*/
/*----------------------------------------------------------------------------------------
 ���� �}�g���b�N�X�z��  [y][x] ����

 �ݒu�σu���b�N�̔z��ł��B�������̃u���b�N���͕ʂɊǗ����܂��B
----------------------------------------------------------------------------------------*/
var gMatrix = [];
for(var i = 0; i < MATRIX_HEIGHT; i++){
  gMatrix.push([]);
  for(var j = 0; j < MATRIX_WIDTH; j++){
    gMatrix[i].push(0);
  }
}
/*----------------------------------------------------------------------------------------
 ���� �I�u�W�F�N�g: �e��u���b�N ����
----------------------------------------------------------------------------------------*/
function Block(id){
  this.id = id;
  this.toVanish = (id == 2);           // �����\�񂳂�Ă���u���b�N?

  switch(id){
  case 0:  // ��
    this.passable = true;    // ���蔲���\?
    break;
  case 1:  // �D�F�u���b�N
    this.passable = false;
    break;
  case 2:  // �������o���̃u���b�N�BRemoveReservedLines �ň�ď��������
    this.passable = true;
    break;
  // �ݒu�ς̊e�u���b�N
  case 21: case 22: case 23: case 24: case 25: case 26: case 27:
    this.passable = false;
    break;
  // ���̑��̊e�u���b�N
  case 11: case 12: case 13: case 14: case 15: case 16: case 17:
  case 31: case 32: case 33: case 34: case 35: case 36: case 37:
  case 41: case 42: case 43: case 44: case 45: case 46: case 47:
  case 51: case 52: case 53: case 54: case 55: case 56: case 57:
    this.passable = false;
    break;
  // ���̑��̔ԍ�(���݂��Ȃ��u���b�N)�Ȃ�摜�̃L���b�V�������Ȃ�
  default:
    this.passable = false;
    return;
  }

  this.image = 'img/b' + id + '.png';  // �摜�B24 x 24 �s�N�Z��
  this.cache = new Image();
  this.cache.src = this.image;
}
/*----------------------------------------------------------------------------------------
 ���� �u���b�N�I�u�W�F�N�g�ւ̃A�N�Z�X ����
----------------------------------------------------------------------------------------*/
var gBlocks = [];
for(var i = 0; i <= 57; i++) gBlocks.push(new Block(i));
function BlkEmpty(){return gBlocks[0] }
function BlkVanishing(){return gBlocks[2] }
/*----------------------------------------------------------------------------------------
 ���� �I�u�W�F�N�g: ��ʓI�ȉ�]���[�� (ROTation RULE - GENeral) ����
----------------------------------------------------------------------------------------*/
function RotRuleGen(){
  // [��]����(0=�E, 1=��)][��]�O�̃~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][���[�� ID ]
  this.dx = [[[0, -1, -1,  0, -1],    // i �� r
              [0,  1,  1,  0,  1],    // r �� v
              [0,  1,  1,  0,  1],    // v �� l
              [0, -1, -1,  0, -1]],   // l �� i
             [[0,  1,  1,  0,  1],    // i �� l
              [0,  1,  1,  0,  1],    // r �� i
              [0, -1, -1,  0, -1],    // v �� r
              [0, -1, -1,  0, -1]]];  // l �� v
  this.dy = [[[0,  0, -1,  2,  2],    // i �� r
              [0,  0,  1, -2, -2],    // r �� v
              [0,  0, -1,  2,  2],    // v �� l
              [0,  0,  1, -2, -2]],   // l �� i
             [[0,  0, -1,  2,  2],    // i �� l
              [0,  0,  1, -2, -2],    // r �� i
              [0,  0, -1,  2,  2],    // v �� r
              [0,  0,  1, -2, -2]]];  // l �� v
  return this;
}
/*----------------------------------------------------------------------------------------
 ���� �I�u�W�F�N�g: I �~�m�̉�]���[�� (ROTation RULE - I) ����
----------------------------------------------------------------------------------------*/
function RotRuleI(){
  // [��]����(0=�E, 1=��)][��]�O�̃~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][���[�� ID ]
  this.dx = [[[0, -2,  1, -2,  1],    // i �� r
              [0, -1,  2, -1,  2],    // r �� v
              [0,  2, -1,  2, -1],    // v �� l
              [0,  1, -2,  1, -2]],   // l �� i
             [[0, -1,  2, -1,  2],    // i �� l
              [0,  2, -1,  2, -1],    // r �� i
              [0,  1, -2,  1, -2],    // v �� r
              [0, -2,  1, -2,  1]]];  // l �� v
  this.dy = [[[0,  0,  0,  1, -2],    // i �� r
              [0,  0,  0, -2,  1],    // r �� v
              [0,  0,  0, -1,  2],    // v �� l
              [0,  0,  0,  2, -1]],   // l �� i
             [[0,  0,  0, -2,  1],    // i �� l
              [0,  0,  0, -1,  2],    // r �� i
              [0,  0,  0,  2, -1],    // v �� r
              [0,  0,  0,  1, -2]]];  // l �� v
  return this;
}
/*----------------------------------------------------------------------------------------
 ���� �e��]���[���ւ̃A�N�Z�X�ݒ� ����
----------------------------------------------------------------------------------------*/
var gRotationRuleGeneral = new RotRuleGen();
var gRotationRuleI = new RotRuleI();
/*----------------------------------------------------------------------------------------
 ���� �I�u�W�F�N�g: �e��~�m ����
----------------------------------------------------------------------------------------*/
function IMino(){
  this.id = 1;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[0, 0, 0, 0],
                 [1, 1, 1, 1], 
                 [0, 0, 0, 0], 
                 [0, 0, 0, 0]],

                [[0, 0, 1, 0], 
                 [0, 0, 1, 0], 
                 [0, 0, 1, 0], 
                 [0, 0, 1, 0]],

                [[0, 0, 0, 0], 
                 [0, 0, 0, 0],
                 [1, 1, 1, 1],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0], 
                 [0, 1, 0, 0], 
                 [0, 1, 0, 0], 
                 [0, 1, 0, 0]]];
  this.activeBlockId = 11;
  this.placedBlockId = 21;
  this.ghostBlockId  = 31;
  this.guideBlockId  = 41;
  this.ghostGuideBlockId = 51;
  this.rotationRule = gRotationRuleI;
  return this;
}
//----------------------------------------------------------------------------------------
function TMino(){
  this.id = 2;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[0, 1, 0, 0],
                 [1, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0],
                 [0, 1, 1, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 0, 0, 0],
                 [1, 1, 1, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0],
                 [1, 1, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]]];
  this.activeBlockId = 12;
  this.placedBlockId = 22;
  this.ghostBlockId  = 32;
  this.guideBlockId  = 42;
  this.ghostGuideBlockId = 52;
  this.rotationRule = gRotationRuleGeneral;
  return this;
}
//----------------------------------------------------------------------------------------
function JMino(){
  this.id = 3;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[1, 0, 0, 0],
                 [1, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 1, 0],
                 [0, 1, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 0, 0, 0],
                 [1, 1, 1, 0],
                 [0, 0, 1, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0],
                 [0, 1, 0, 0],
                 [1, 1, 0, 0],
                 [0, 0, 0, 0]]];
  this.activeBlockId = 13;
  this.placedBlockId = 23;
  this.ghostBlockId  = 33;
  this.guideBlockId  = 43;
  this.ghostGuideBlockId = 53;
  this.rotationRule = gRotationRuleGeneral;
  return this;
}
//----------------------------------------------------------------------------------------
function LMino(){
  this.id = 4;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[0, 0, 1, 0],
                 [1, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0],
                 [0, 1, 0, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0]],

                [[0, 0, 0, 0],
                 [1, 1, 1, 0],
                 [1, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[1, 1, 0, 0],
                 [0, 1, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]]];
  this.activeBlockId = 14;
  this.placedBlockId = 24;
  this.ghostBlockId  = 34;
  this.guideBlockId  = 44;
  this.ghostGuideBlockId = 54;
  this.rotationRule = gRotationRuleGeneral;
  return this;
}
//----------------------------------------------------------------------------------------
function ZMino(){
  this.id = 5;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[1, 1, 0, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 0, 1, 0],
                 [0, 1, 1, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 0, 0, 0],
                 [1, 1, 0, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0],
                 [1, 1, 0, 0],
                 [1, 0, 0, 0],
                 [0, 0, 0, 0]]];
  this.activeBlockId = 15;
  this.placedBlockId = 25;
  this.ghostBlockId  = 35;
  this.guideBlockId  = 45;
  this.ghostGuideBlockId = 55;
  this.rotationRule = gRotationRuleGeneral;
  return this;
}
//----------------------------------------------------------------------------------------
function SMino(){
  this.id = 6;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[0, 1, 1, 0],
                 [1, 1, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 0, 0],
                 [0, 1, 1, 0],
                 [0, 0, 1, 0],
                 [0, 0, 0, 0]],

                [[0, 0, 0, 0],
                 [0, 1, 1, 0],
                 [1, 1, 0, 0],
                 [0, 0, 0, 0]],

                [[1, 0, 0, 0],
                 [1, 1, 0, 0],
                 [0, 1, 0, 0],
                 [0, 0, 0, 0]]];
  this.activeBlockId = 16;
  this.placedBlockId = 26;
  this.ghostBlockId  = 36;
  this.guideBlockId  = 46;
  this.ghostGuideBlockId = 56;
  this.rotationRule = gRotationRuleGeneral;
  return this;
}
//----------------------------------------------------------------------------------------
function OMino(){
  this.id = 7;
  // [�~�m�̌���(0=�o����, 1=�E, 2=�t, 3=��)][ Y ���W][ X ���W]
  this.shape = [[[0, 1, 1, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 1, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 1, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]],

                [[0, 1, 1, 0],
                 [0, 1, 1, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]]];
  this.activeBlockId = 17;
  this.placedBlockId = 27;
  this.ghostBlockId  = 37;
  this.guideBlockId  = 47;
  this.ghostGuideBlockId = 57;
  this.rotationRule = gRotationRuleGeneral;  // �K�v�Ȃ��ł����֋X��
  return this;
}
/*----------------------------------------------------------------------------------------
 ���� T-SPIN ����ɗp����u���b�N�ʒu ����

 ttt.js �� TsType ������Ăяo����܂��B[dir][y][x]
 1 �ɂȂ��Ă���ꏊ(�e 4 �ӏ�)�̂��� 3 �ӏ��ȏオ�ʉߕs�Ȃ�� T-SPIN �Ɣ��肳��܂��B
----------------------------------------------------------------------------------------*/
var gTsTiles = [[[1, 0, 1, 0],
                 [0, 0, 0, 0],
                 [1, 0, 1, 0],
                 [0, 0, 0, 0]],
                [[1, 0, 1, 0],
                 [0, 0, 0, 0],
                 [1, 0, 1, 0],
                 [0, 0, 0, 0]],
                [[1, 0, 1, 0],
                 [0, 0, 0, 0],
                 [1, 0, 1, 0],
                 [0, 0, 0, 0]],
                [[1, 0, 1, 0],
                 [0, 0, 0, 0],
                 [1, 0, 1, 0],
                 [0, 0, 0, 0]]];
/*----------------------------------------------------------------------------------------
 ���� T-SPIN MINI ����ɗp����u���b�N�ʒu ����

 ttt.js �� TsType ������Ăяo����܂��B[dir][y][x]
//----------------------------------------------------------------------------------------
 T-SPIN ���������Ă���ꍇ�A���ꂪ�ʏ�� T-SPIN ���A���邢�� T-SPIN MINI ���𔻒肵�܂��B
 1 �ɂȂ��Ă���ꏊ(�e 2 �ӏ�)�� 2 �ӏ��Ƃ��ʉߕs�Ȃ�� T-SPIN �ɁA�����łȂ���� T-SPIN
 MINI �Ɣ��肳��܂��B��O�I�ɁA���O�ɑ� 5 ���̉�]�������ꍇ�� T-SPIN MINI �ɂȂ�Ȃ���
 ��܂�( TST ���̉�]��u T-SPIN FIN �v��)�B
----------------------------------------------------------------------------------------*/
var gTssTiles = [[[1, 0, 1, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0]],
                 [[0, 0, 1, 0],
                  [0, 0, 0, 0],
                  [0, 0, 1, 0],
                  [0, 0, 0, 0]],
                 [[0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [1, 0, 1, 0],
                  [0, 0, 0, 0]],
                 [[1, 0, 0, 0],
                  [0, 0, 0, 0],
                  [1, 0, 0, 0],
                  [0, 0, 0, 0]]];
/*----------------------------------------------------------------------------------------
 ���� �e�~�m�ւ̃A�N�Z�X�ݒ� ����
----------------------------------------------------------------------------------------*/
var I = new IMino();
var T = new TMino();
var J = new JMino();
var L = new LMino();
var Z = new ZMino();
var S = new SMino();
var O = new OMino();
var gMino = [null, I, T, J, L, Z, S, O];
/*----------------------------------------------------------------------------------------
 ���� �I�u�W�F�N�g: �K�C�h ����

 �~�m�͎����I�ɍ��������Ă�����̂��I�΂�܂��B
----------------------------------------------------------------------------------------*/
function Guide(dir, x, y){
  this.dir = dir;
  this.x = x;
  this.y = y;  // �f�b�h���C���̕��͊܂߂Ȃ�
}
/*----------------------------------------------------------------------------------------
 ���� �K�C�h�I�u�W�F�N�g�����̊ȗ��\�L ����
----------------------------------------------------------------------------------------*/
function G(dir, x, y){
  return new Guide(dir, x, y);
}
/*----------------------------------------------------------------------------------------
 ���� �Z�N�V�������̎擾 ����

 <id>�Ԗڂ̃Z�N�V���������擾���܂��B������ҏW�����ꍇ�́A�Y�ꂸ�� index.html �ɂ����f��
 ���Ă��������B
----------------------------------------------------------------------------------------*/
function SectionTitle(id){
  switch(id){
  case  0: return '1 Warm up with TETRIS (4 rows erased)'; break;
  case  1: return '2 Before T-SPIN, a lecture on how to use T-Mino properly'; break;
  case  2: return '3 TSD with T-shaped hole'; break;
  case  3: return '4 TSD with series holes'; break;
  case  4: return '5 TSD with series holes [no guide]'; break;
  case  5: return '6 「Equilibrium technique」 (Loading type)'; break;
  case  6: return '7 「Equilibrium technique」 (Loading type) [No Guide]'; break;
  case  7: return '8 Small tricks TSM (T spin mini) '; break;
  case  8: return '9 Maximum attack power! TST (T spin triple)'; break;
  case  9: return '10 Assemble the TST'; break;
  case 10: return '11 Popular Openers'; break;
  case 11: return '12 Shaving'; break;
  case 12: return '13 Digging'; break;
  case 13: return '14 J / L Spins (SRS. Super Rotation System)'; break;
  case 14: return '15 S / Z Spins'; break;
  case 15: return '16 I Spins and New T-SPINs (Iso Neo Fin)'; break;
  case 16: return '17 SRS Practice'; break;
  case 17: return '18 SRS Practice [No Guide]'; break;
  case 18: return '19 Mid-term test'; break;
  case 19: return '20 Finesee Movement optimization (OITJL)'; break;
  case 20: return '21 Finesse Movement optimization (SZ)'; break;
  case 21: return '22 Various T-SPIN techniques & Openers (2)'; break;
  case 22: return '23 「Equilibrium technique」(shaving type)'; break;
  case 23: return '24 「Donation」'; break;
  case 24: return '25 「uDonation」 [No guide]'; break;
  case 25: return '26 Prophecy T-spins'; break;
  case 26: return '27 Prophecy T-spins [No guide]'; break;
  case 27: return '28 Final test'; break;
  case 28: return '29 Graduation test (difficult problems)'; break;
  case 29: return '30 Bonus'; break;
  }
  return "？";
}
