<?php

class ouick_table{
  public $table_id;
  public $dataset_id;
  public $title;
  public function __construct($table_id=null){
    if(isset($table_id))
    $this->table_id = $table_id;
  }
  public function save(){
    $db = new db();
    $values['dataset_id'] = $this->dataset_id;
    $values['title'] = $this->title;
    $this->table_id = $db->insert('tables', $values);

  }
  public function remove(){
    $db = new db();
    $fields = $db->shiftResult($db->select('fields',array('table_id',$this->table_id)),'id');
    foreach($fields AS $field){
      $field_ids[] = $field['id'];
    }


    $query = 'DELETE FROM `fields` WHERE id IN ('.join(',',$field_ids).');';
    $query .= 'DELETE FROM `field_values` WHERE field_id IN ('.join(',',$field_ids).');';
    $query .=  "DELETE FROM `tables` WHERE id='".$this->table_id."'";

    return $db->query($query);
  }
  public function getFieldIdArray(){

    $db = new db();
    
    $result = [];
    foreach($db->shiftResult($db->select('fields', array('table_id', $this->table_id), array('id')), 'id') AS $field){
      $result[] = $field['id'];
    }
    return $result;
  }
  public function numberOfRows(){

    $db = new db();

    $query = "SELECT MAX(row) FROM field_values WHERE field_id IN (".implode(',',$this->getFieldIdArray()).")";

    $result = $db->query($query);

    return $result[0];
  }
  public function deleteRow($row_id){

    $db = new db();
    $query = "DELETE FROM field_values WHERE field_id IN (".implode(',',$this->getFieldIdArray()).") AND row=".(int)$row_id;
    $db->query($query);
    echo 1;
  }
  public function createRow($fields){

    //echo $this->table_id;
    $numberOfRows = $this->numberOfRows();
    $db = new db();
    //var_dump($fields);
    foreach($fields AS $field_id => $field_value){
      $field = array();
      $field['field_id'] = $field_id;
      $field['row'] = $numberOfRows+1;
      $field['value'] = $field_value;
      $field['timestamp'] = time();

      $db->insert('field_values', $field)."\n";
    };
    echo $numberOfRows;
  }
  public static function toJson($dataset){
    $db = new db();
    $result = array();
    $results = array();

    //get all tables from db
    $tables = $db->shiftResult($db->query('SELECT * FROM `tables` WHERE dataset_id='.(int)$dataset),'id');

    //loop all tables
    foreach($tables AS $table){
      $result['id'] = $table['id'];
      $result['title'] = $table['title'];
      $result['fields'] = array();
      $result['formulars'] = array();
      
      
      //select forms for table
      $forms = $db->shiftResult($db->select('forms',array('table_id',$table['id'])),'table_id');
      foreach($forms AS $form){
        /*$newField = array();
        foreach($fieldData AS $index=>$value)
          if(!is_numeric($index))
            $newField[$index] = $value;*/

        $result['formulars'][] = $form;
      }
      
      
      //select fields for table
      $tempFields = $db->shiftResult($db->select('fields',array('table_id',$table['id'])),'table_id');
      foreach($tempFields AS $fieldData){
        $newField = array();
        foreach($fieldData AS $index=>$value)
          if(!is_numeric($index))
            $newField[$index] = $value;

        $result['fields'][] = $newField;
      }
      $result['field_values'] = array();
      if(is_array($result['fields']))
      foreach($result['fields'] AS $table_field){
        if(is_array($table_field)){
          //select field values for field ordered by row
          $resultz = $db->shiftResult($db->select('field_values',array('field_id',$table_field['id']), array('field_id', 'row','value', 'timestamp'), array('row','DESC')), 'field_id');
          if(is_array($resultz))
            $result['field_values'] = array_merge($resultz, $result['field_values']);
        }
      }

      $results[] = $result;
    }

    return json_encode($results, true);
  }
}
class ouick_field{

  public $id;
  public $table_id;
  public $type;
  public $title;
  public $value;
  public $additional;
  public $default_value;
  public function __construct($id=null){
    if($id)
      $this->id = $id;
  }
  public function save(){
    $values['table_id'] = $this->table_id;
    $values['type'] = $this->type;
    $values['title'] = $this->title;
    $values['additional'] = $this->additional;
    $values['default_value'] = $this->default_value;

    $db = new db();
    $this->id = $db->insert('fields', $values);
    return $this->id;
  }
  public function update(){
      $db = new db();
      $field = array();
      $field['field_id'] = $this->id;
      $field['row'] = $this->row;
      $field['value'] = $this->value;
      $field['timestamp'] = time();

      return $db->insert('field_values', $field)."\n";
  }
  public static function remove(){

  }
  public static function changeFieldPostion(){

  }
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}
