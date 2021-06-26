import React,{useState, useEffect} from 'react'
import {View,StyleSheet,Image,ToastAndroid,BackHandler, TouchableOpacity} from 'react-native'
import { ActivityIndicator, TextInput } from 'react-native-paper';
import { Container,  Left, Body,Right,Item, Input, Text,  CardItem, Thumbnail, Content, } from 'native-base'
import {normalize} from '../actions/Functions'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {RFValue } from "react-native-responsive-fontsize";
import AdView from '../components/NativeAddSearchResults'
import {backgroundColor,fontmedium,fontblack,white,buttonBgColor,appcolor, color, fontfamily, fontbold, lightgray, deepgray} from '../constants/colors'
import master_api from '../constants/api'
import { StatusBar } from 'react-native'
import { Col, Row, Grid } from 'react-native-easy-grid';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import {AdMobInterstitial} from 'react-native-admob';
import { historySchema, HISTORY_SCHEMA} from '../Database/Schema';
import Realm from 'realm';
import REDPROFILE from '../assets/RedProfile.svg'
import YELLOWPROFILE from '../assets/YELLOWPROFILE.svg'
let realm;
import AVATAR from '../assets/avatarbg.svg'

realm = new Realm({
  path: `${HISTORY_SCHEMA}.realm`, 
  schema: [historySchema],
  schemaVersion: 0
});
const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient)

const SearchScreen  = ({navigation, route}) =>{
  const [search, setSearch] = useState(route.params.item.number) //923422297234
  const [iso2, setIos2] = useState(route.params.item.iso2)
  const [user_suggested_name, setUserSuggestedName] =   useState('')
  const [userdataserver , setuserData] = useState({})
  const [appuser, setAppuser] = useState(false)
  const [suggested_name, setSuggestednames] = useState([])
  const [found, setFound] = useState(false)
  const [Loading, setLoading] = useState(true)
  const [photo1, setPhoto1] = useState(null);
  const [db2 , setDb2] = useState(null)
  const [skypeloading,  setskypeLoading] = useState(false)
  const [countriesdetails, setCountryDetails] = useState(null)
  const [isReported, setIsReported] = useState(false) 
  const [isSuggestName, setIsSuggestedName]  = useState(false)
  function handleBackButtonClick() {
    navigation.goBack();
    return true;
  }
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);
  useEffect(() => {

  },[suggested_name])
  useEffect(() => {
  
    searchnumber()
      // AdMobInterstitial.showAd().catch(error => {
      // });
       
      //  AdMobInterstitial.addEventListener('adClosed',() => {
         
      //       AdMobInterstitial.requestAd().catch(error =>{
      //          console.log("request faild", error)});
      //  }); 
      //  return () =>AdMobInterstitial.removeAllListeners();
       
  },[])
  

  const searchnumber = () =>{ 
   
    let formdata  = new FormData();
  
     formdata.append("mobile_number",`${route.params.item.number.substring(1)}`)
     formdata.append("iso2", route.params.item.iso2)
      var requestOptions = {
       method: 'POST',
       body: formdata
   };
  try{
   fetch(`${master_api}/number_search_2.php`, requestOptions)
     .then(response => response.json())
     .then(result => {
       if(result.success){
           if(result.appuser){
             setAppuser(true);
             setLoading(false)
             setuserData(result.data);
             setCountryDetails(result.countrydetails)
             setFound(true)
             realm.write(() => {
              var ID =
                realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true).length > 0
                  ? realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true)[0]
                      .HistoryID + 1
                  : 1;
                realm.create(HISTORY_SCHEMA, {
                  HistoryID: ID,
                  name:result.data.name,
                  iso2:iso2,
                  number:search,
                  image:result.data.user_profile_url
                });
            })
           }else if(result.db === "db2"){
            realm.write(() => {
              var ID =
                realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true).length > 0
                  ? realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true)[0]
                      .HistoryID + 1
                  : 1;
                realm.create(HISTORY_SCHEMA, {
                  HistoryID: ID,
                  name:result.data.name,
                  iso2:iso2,
                  number:search,
                  image:""
                });
            })
            setuserData(result.data)
            setCountryDetails(result.countrydetails)
            setFound(true)
            setDb2(true)
            setLoading(false)
           }else{
            realm.write(() => {
              var ID =
                realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true).length > 0
                  ? realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true)[0]
                      .HistoryID + 1
                  : 1;
                realm.create(HISTORY_SCHEMA, {
                  HistoryID: ID,
                  name:result.data.filtered_contact_name,
                  iso2:iso2,
                  number:search,
                  image:result.data.skype_profile_link !== null ?result.data.skype_profile_link:""
                });
            })
               try{
                 setuserData({
                   "id":result.data.filtered_contact_id,
                   "real_name":result.data.filtered_contact_name,
                   "spam_check":result.data.spam_check,
                   "facebook_profile_link":result.data.facebook_profile_link,
                   "image_check":result.data.image_check,
                   "skype_profile_link":result.data.skype_profile_link,
                   "name_checked":result.data.name_check
                 })
                 setCountryDetails(result.countrydetails)
                 setSuggestednames(result.data.suggested_names.sort(function(a, b) { 
                     return a.number_names_suggestions_count < b.number_names_suggestions_count }));
                 setFound(true)
                 setLoading(false)
               }catch(err){                
                 setLoading(false)
                 setFound(false)
               }
             }
       }else{
         setLoading(false)
         setFound(false)
         realm.write(() => {
          var ID =
            realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true).length > 0
              ? realm.objects(HISTORY_SCHEMA).sorted('HistoryID', true)[0]
                  .HistoryID + 1
              : 1;
            realm.create(HISTORY_SCHEMA, {
              HistoryID: ID,
              name:search,
              iso2:iso2,
              number:search,
              image:""
            });
        })
       }
    
   }).catch(error => {
     setLoading(false)
     setFound(false)
     
   });
}catch(error){
 
      setLoading(false)
      setFound(false)
}

  }
     
  const suggest_name_count_increment = (item) => {

    let index = suggested_name.findIndex(obj => obj.suggested_name === item.suggested_name && obj.number_names_suggestions_count === item.number_names_suggestions_count);
   
    if(item.number_names_suggestions_count === null){
      item.number_names_suggestions_count = 1
    }else{
      item.number_names_suggestions_count = parseInt(item.number_names_suggestions_count ,10) + 1
    }
  
  let d = suggested_name
  //console.log(d, "data object before update")
  d[index] = item;
  //console.log(d, "data object after update")
  setSuggestednames([...d])
      var formdata = new FormData();
      formdata.append("submit", "submit");
      formdata.append("contact_id", `${userdataserver.id}`);
      formdata.append("suggest_name", `${item.suggested_name}`);
      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'manual'
      };
    try{
      fetch(`${master_api}/suggested_number_count_increment.php`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if(result.success){
            ToastAndroid.showWithGravityAndOffset(
              "Thanks for your suggesstion.",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
            
          }else{
            ToastAndroid.showWithGravityAndOffset(
              "Failed. Please try Again",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
          }
      }).catch(error =>{
        console.log(error)
      });
    }catch(Err){
      console.log("Catch" , Err)
    }
  }

  const suggest_name_by_user_not_in_our_database = () =>{
    if(user_suggested_name.length >=3 ){
    
    var formdata = new FormData();
    console.log(search.substring(1),user_suggested_name,iso2,`1`)
    formdata.append("contact", search.substring(1));
    formdata.append("suggest_name", `${user_suggested_name}`);
    formdata.append("country_code", iso2);
    formdata.append("user_id","1");
    
    var requestOptions = {
      method: 'POST',
      body: formdata,
      
    };
    try{
      fetch(`${master_api}filtered_contacts_insert.php`, requestOptions)
        .then(response => response.json())
        .then(result => {
          console.log(result)
          setIsSuggestedName(true)
          if(result.success){
            ToastAndroid.showWithGravityAndOffset(
              "Thanks for your suggesstion.",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
            
          }else{
            ToastAndroid.showWithGravityAndOffset(
              "Failed. Please try Again",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
          }
          
      }).catch(error =>{
        console.log(error)
      });
    }catch(Err){
      console.log("Catch" , Err)
    }
  }else{
    alert("Pleae Enter Atleast three characters")
  }
  }

  const suggest_name_by_user_from_database2 = () =>{
  
    if(user_suggested_name.length >=3 ){
  
    var formdata = new FormData();
    
    formdata.append("contact", `${search}`);
    formdata.append("suggest_name", `${user_suggested_name}`);
    formdata.append("country_code", iso2);
    formdata.append("user_id","1");
    
    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'manual'
    };
    try{
      fetch(`${master_api}/filtered_contacts_insert_db2.php`, requestOptions)
        .then(response => response.json())
        .then(result => {
          if(result.success){
            ToastAndroid.showWithGravityAndOffset(
              "Thanks for your suggesstion.",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
            
          }else{
            ToastAndroid.showWithGravityAndOffset(
              "Failed. Please try Again",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
          }
          
      }).catch(error =>{
        console.log(error)
      });
    }catch(Err){
      console.log("Catch" , Err)
    }
    }else{
      alert("Please enter at least three characters")
    }
  }

  const suggest_name_by_user = () =>{
    
    if(user_suggested_name.length >=3 ){
      var formdata = new FormData();
      formdata.append("submit", "submit");
      formdata.append("suggest_name", `${user_suggested_name}`);
      formdata.append("contact_id", `${userdataserver.id}`)      
      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'manual'
      };
      try{
        fetch(`${master_api}/suggested_number_count_increment.php`, requestOptions)
          .then(response => response.json())
          .then(result => {
            setIsSuggestedName(true)
            ToastAndroid.showWithGravityAndOffset(
              "Thanks Your Suggestion",
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
        }).catch(error =>{
          ToastAndroid.showWithGravityAndOffset(
            "Something went wrong.",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        });
      }catch(Err){
        console.log("Catch" , Err)
      }
    }else{
      alert("Please enter a valid name")
    }
    
  }

  const report_spam = () =>{ 
    var formdata = new FormData();
    formdata.append("id", userdataserver.id);
    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'manual'
    };
      try{
        fetch(`${master_api}/spam_report_id.php`, requestOptions)
          .then(response => response.json())
          .then(result => {
          console.log(result,"resss")
            if(result.success){
              setIsReported(true)
              setuserData({...userdataserver,spam_check:parseInt(userdataserver.spam_check,10)+ parseInt(1)})
              ToastAndroid.showWithGravityAndOffset(
                "Reported Spam Sucessfully",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
              );
              
            }else{
              ToastAndroid.showWithGravityAndOffset(
                "Failed. Please try Again",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
              );
            }
            
        }).catch(error =>{
          console.log(error,"error")
          ToastAndroid.showWithGravityAndOffset(
            "Failed. Please try Again",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        });
      }catch(Err){
        console.log(Err ,"Err")
        ToastAndroid.showWithGravityAndOffset(
          "Failed. Please try Again",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
  }

  const report_spam_db2 = () =>{ 
    
    var formdata = new FormData();
    formdata.append("mobile_number",search);
    formdata.append("iso2",iso2)
    formdata.append("name", userdataserver.name)
    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'manual'
    };
      try{
        fetch(`${master_api}/spam_report_id_db2.php`, requestOptions)
          .then(response => response.json())
          .then(result => {
            
            if(result.success){
              setIsReported(true)
              ToastAndroid.showWithGravityAndOffset(
                "Reported Spam Sucessfully",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
              );
              
            }else{
              ToastAndroid.showWithGravityAndOffset(
                "Failed. Please try Again",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
              );
            }
            
        }).catch(error =>{
          ToastAndroid.showWithGravityAndOffset(
            "Failed. Please try Again",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
          );
        });
      }catch(Err){
        ToastAndroid.showWithGravityAndOffset(
          "Failed. Please try Again",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }
  }

  const getskypephoto = () =>{
    setskypeLoading(true);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "mobile_number":`${search.substring(1)}`       
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'manual'
    };

    fetch(`${master_api}/get_skype_photo.php`, requestOptions)
    .then(response => response.json())
    .then(result => {
      setskypeLoading(false)  
      if(result.results.length){
            let uri = `https://avatar.skype.com/v1/avatars/${result.results[0].nodeProfileData.skypeId}?auth_key=-1285080687&size=l`
            setPhoto1(uri);
        
        }else{
            ToastAndroid.showWithGravityAndOffset(
                "No photo Found",
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50
            );
            
        }
    })
    .catch(error => {
      
      setskypeLoading(false)
        ToastAndroid.showWithGravityAndOffset(
            "No photo Found",
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50
            );
    });

  }

  const ShemmerRender = () => {
    return(
      <ShimmerPlaceHolder 
        style={{width:wp(65), height:wp(3), borderRadius:1}}
        location={[.2,.5,.9]} 
        shimmerColors={["#ededed","#e0e0e0","#ededed"]}
    />
    )
  }
    
  
const ShemmerRender2 = () => {
  return(
        <CardItem style={{flexDirection:"column",margin:5,borderRadius:1, alignItems:"flex-start", justifyContent:"space-around", height:wp(20), backgroundColor:lightgray}}>
              <ShimmerPlaceHolder 
                style={{width:wp(90), height:wp(3), borderRadius:1}} 
                location={[.2,.5,.9]} 
                shimmerColors={["#ededed","#e0e0e0","#ededed"]}
              />
              <ShimmerPlaceHolder 
                style={{width:wp(90), height:wp(3), borderRadius:1}} 
                location={[.2,.5,.9]} 
                shimmerColors={["#ededed","#e0e0e0","#ededed"]}
              />
        </CardItem>
  )
}
  if(Loading){
    return(
      <Container style={{...styles.container, }}>
        
        <CardItem style={{backgroundColor:"#EEE", margin:5,borderRadius:1,}}>
            <ShimmerPlaceHolder  style={{width:wp(20), height:wp(20), borderRadius:wp(20)}} 
             location={[.2,.5,.9]} 
             shimmerColors={["#e0e0e0",'#e0e0e0',"#ededed"]} />
            <CardItem style={{flexDirection:"column", alignItems:"flex-start", justifyContent:"space-around", height:wp(20), backgroundColor:lightgray}}>
            {ShemmerRender()}{ShemmerRender()}{ShemmerRender()}
              
            </CardItem>
        </CardItem>
            
        {ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}{ShemmerRender2()}
      </Container>
    )
  }

  if(db2){
    return(
      <Container style={styles.container}>     
      <Content
        style={db2styles.content}
        contentContainerStyle={db2styles.contentContainerStyle} >
        <CardItem noLeft style={{...styles.maincard,backgroundColor:"#ECF0F3"}} >
            <Body cardBody style={{flexDirection:"column"}} >
                <View style={db2styles.bodyinnermainview}> 
                
                  {skypeloading?
                    <View style={db2styles.skypeloadingview}>
                      <ActivityIndicator size={"small"} color="#ffffff" />
                    </View>
                  :null}
                  
                  {photo1 !== null?
                    <Thumbnail large source={{uri:photo1}} />
                    :<AVATAR width={wp(20)} height={wp(20)} /> 
                  }
                 
                  <View style={db2styles.dataviewmain}>
                      <View style={db2styles.dataviewmaininner}>    
                          <Text style={db2styles.label}>
                              Name:
                          </Text>
                      <Text numberOfLines={1} style={db2styles.nametext}> 
                      {" "}{userdataserver.name.substring(0,13)}
                      </Text>              
                  </View>  
                  
                  <View style={db2styles.dataviewmaininner}>    
                      <Text style={{...db2styles.label,fontFamily:fontbold}}>
                        Reported Spam:
                      </Text>
                      
                      <Text numberOfLines={1} style={db2styles.nametext}>
                         {" "}{isReported?1:0} times
                      </Text> 
                  </View>
                      
                  <View style={db2styles.dataviewmaininner}>
                      <Image source={{uri:`https://zoobiapps.com/country_flags/${iso2.toLowerCase()}.png`}} 
                          style={db2styles.countryflag} />
                      <Text numberOfLines={1} style={db2styles.nametext}>
                          {countriesdetails.city !== ""?countriesdetails.city+' , ':countriesdetails.capital !== ""?countriesdetails.capital + " , ":null}{countriesdetails.country}
                      </Text>           
                  </View>

                  {countriesdetails.network !== ""?
                      <View style={db2styles.dataviewmaininner}>
                          <Image source={{uri:`https://zoobiapps.com/number_finder/network_imgs/${countriesdetails.network.replace(/\s/g, '')}.png`}} 
                              style={db2styles.countryflag} />
                          <Text numberOfLines={1} style={db2styles.nametext}>
                              {countriesdetails.network !== ""?countriesdetails.network + ' , ':null} {countriesdetails.country}
                          </Text>           
                      </View>        
                    :null}
                </View>
            </View>
            
            <View style={db2styles.buttonmaincontainer}>
                <TouchableOpacity onPress={() => getskypephoto()} style={db2styles.getphotobutton}>
                    <Text style={db2styles.getphotobuttontext}>Get photo</Text>
                </TouchableOpacity>  

                {isReported?
                    <TouchableOpacity style={{...db2styles.reportspambutton, flexDirection:"row", backgroundColor:buttonBgColor}}>
                        <AntDesign name="checkcircle" size={14} color={"#fff"} />
                        <Text style={{...db2styles.reportspambuttontext, marginLeft:10, color:"#fff"}}>Done</Text>
                    </TouchableOpacity> 
                  :
                    <TouchableOpacity onPress={() => report_spam_db2()}  style={{...db2styles.reportspambutton,backgroundColor:userdataserver.spam_check<3?"#F94545":userdataserver.spam_check<=5?"#F94545":"#fff", }}>
                      <Text style={{...db2styles.reportspambuttontext, color:userdataserver.spam_check<3?"#fff":userdataserver.spam_check<=5?"#fff":"#F94545",}}>Report Spam</Text>
                    </TouchableOpacity> 

                  } 

            </View>  
        </Body>      
      </CardItem>
          <Text  style={db2styles.suggest_a_name}>
            Suggest a Name
          </Text>
          <TextInput
              label="Please enter name"
              mode="outlined"
              value={user_suggested_name}
              contentContainerStyle={{backgroundColor:"green"}}
              onChangeText={(text) => setUserSuggestedName(text)}
              theme={{ colors: { primary: appcolor,text:appcolor,placeholder:deepgray, underlineColor:deepgray,}}}
              style={db2styles.textinput} 
              returnKeyType = {'search'}
              keyboardType="name-phone-pad"
              returnKeyLabel={'search'}       
            />
            <Grid> 
            <Row style={{ backgroundColor:"transparent", }}>    
                <Col style={{...modalstyles.smallcolumn,}}>
                    <TouchableOpacity onPress={() => {suggest_name_by_user_from_database2()}}
                          style={db2styles.suggest_name_submitbuton}>
                            <Text style={modalstyles.buttonText}>
                                SUBMIT
                            </Text>
                    </TouchableOpacity>
                </Col>
            </Row>
        </Grid>
        <View style={db2styles.adview}>
          <AdView type="image" media={true} />
        </View>
      </Content>    
    </Container>
    )
  }

  if(!found){
    return(
      <Container style={{...styles.container, }}>
        
        <Content
          style={{flex:1}}
          contentContainerStyle={{backgroundColor:"#fff",flexGrow:1}}>
            <Image resizeMode="contain" source={require("../assets/layer.png")}  
              style={{
                position:"absolute",
                top:-hp(15),
                alignSelf:"center",
                minWidth: '100%',
                height:hp(50),
                backgroundColor:"transparent",
                resizeMode:"center",
                tintColor:color
                
              }} />
            <CardItem style={{backgroundColor:"transparent", alignSelf:"center" ,marginHorizontal:wp(2),borderRadius:5, flexDirection:"column", marginVertical:hp(10)}}>
              <Text style={{color:white,fontFamily:fontmedium,textAlign:"center", alignSelf:"center"}} >No Results Found for</Text>
              <Text style={{color:white,fontFamily:fontmedium,textAlign:"center", alignSelf:"center"}} >{route.params.item.number}</Text>
            </CardItem>

            <CardItem style={{...styles.suggestions_card, backgroundColor:lightgray}}>
                <Text numberOfLines={1} style={[styles.nametext,{textAlign:"left",fontFamily:fontmedium, padding:wp(5),color:deepgray, paddingLeft:10,fontSize:RFValue(12), }]}>Would You Like To Suggest a Name</Text> 
                  <Item rounded style={{justifyContent:"flex-start",alignContent:"flex-start", backgroundColor:white, maegin:5, height:40, flex:1, borderColor:"transparent"}}>
                      <Input 
                        value={user_suggested_name}
                        onChangeText={(text) => setUserSuggestedName(text)}
                        placeholder="Please enter name " 
                        style={{
                          paddingLeft:wp(5),
                          height:wp(12),
                            
                          fontFamily:fontfamily, 
                          backgroundColor,
                          
                          borderRadius:5, 
                          fontSize:RFValue(15),
                          color:appcolor
                        }} 
                        returnKeyType = {'search'}
                        keyboardType="name-phone-pad"
                        returnKeyLabel={'search'}       
                      />
                      
                  </Item>
                  <TouchableOpacity style={{marginTop:wp(5)}} onPress={() => suggest_name_by_user_not_in_our_database()}>
                    <Text style={styles.submitbutton}>SUBMIT</Text>
                </TouchableOpacity>
            </CardItem>
            </Content>
      </Container>
    )
  }
    
  if(appuser){
    return(
      <Container style={styles.container}>     
        <StatusBar backgroundColor="#0074c4" />
        <Content
          style={{flex:1}}
          contentContainerStyle={{backgroundColor:'#fff',flexGrow:1}}>
            <Image resizeMode="contain" source={require("../assets/layer.png")}  
                style={appuserstyles.bgimage} />
            
            <CardItem style={{justifyContent:"center",marginVertical:25, backgroundColor:buttonBgColor, flexDirection:"column", width:wp(100) }}>
                <Text style={{color:"#fff", fontSize:RFValue(20), fontFamily:fontbold}}>Verfied User</Text>
                <MaterialIcons name="verified" size={RFValue(25)}  color={"#fff"} />
            </CardItem>
            <View style={{alignSelf:"center"}}>
                <View style={appuserstyles.image}>
                  <Image style={appuserstyles.image2}  source={{uri:userdataserver.user_profile_url}} />
                </View>
                <MaterialIcons name="verified" size={RFValue(25)} 
                    style={{position:"absolute", zIndex:2,alignSelf:"flex-end",marginTop:wp(30),right:10, color:buttonBgColor, backgroundColor:"transparent", borderRadius:wp(20),}}
                />
            </View>
              <Text style={{...appuserstyles.text,alignSelf:"center", marginTop:wp(7), color:"rgba(0,0,0,.7)"}}>{userdataserver.name}</Text>
              <CardItem style={{...appuserstyles.datacard, flexDirection:"row"}}>
                  <MaterialIcons name='contact-phone' color={"rgba(0,0,0,.7)"} size={RFValue(20)} />
                  <Text style={{...appuserstyles.text,marginLeft:wp(5)}}>0{userdataserver.mobile_number}</Text>
              </CardItem>
              <CardItem style={{...appuserstyles.datacard, paddingTop:20,paddingBottom:20,}}>
                {userdataserver.email !== ""? 
                      <View style={{flexDirection:"row",marginTop:wp(2)}}>
                          <MaterialIcons name='email' color={"rgba(0,0,0,.7)"} size={RFValue(20)} />
                          <Text style={{...appuserstyles.text,fontSize:RFValue(13), marginLeft:wp(5)}}>{userdataserver.email}</Text> 
                      </View>
                :null} 
            {countriesdetails.network !== ""?
               <View style={{flexDirection:"row",marginTop:wp(2)}}>
                  <MaterialCommunityIcons  name='signal' color={"rgba(0,0,0,.7)"} size={RFValue(20)} />
                  <Text style={{...appuserstyles.text,fontSize:RFValue(13), marginLeft:wp(5)}}>{countriesdetails.network}, {countriesdetails.country}</Text>           
                </View>
            :null}

            {countriesdetails.city !== ""?
               <View style={{flexDirection:"row",marginTop:wp(2)}}>
                  <MaterialIcons  name='location-on' color={"rgba(0,0,0,.7)"} size={RFValue(20)} />
                  <Text style={{...appuserstyles.text,fontSize:RFValue(13), marginLeft:wp(5)}}>{countriesdetails.city}, {countriesdetails.country}</Text>           
                </View>
            :null}
            </CardItem>
          
        </Content>
         <AdView type="image" media={false} />
      </Container>
    )
  }
  return(
    <Container style={styles.container}>     
      <Content
        style={{flex:1, backgroundColor:"#fff"}}
        contentContainerStyle={{backgroundColor:"#fff",flexGrow:1}} >
        <CardItem noLeft style={{...styles.maincard,backgroundColor:userdataserver.spam_check<3?"#ECF0F3":userdataserver.spam_check<=5?"#F9C345":"#FC4F4F"}} >
            <Body cardBody style={{flexDirection:"column",justifyContent:"center"}} >
           
                <View style={db2styles.bodyinnermainview}> 
                 
                {skypeloading?
                  <View style={db2styles.skypeloadingview}>
                    <ActivityIndicator size={"small"} color="#ffffff" />
                  </View>
                :null}


                {
                photo1 !== null ? <Thumbnail large source={{uri:photo1}}  style={{backgroundColor:"gray"}}  />  :
                userdataserver.skype_profile_link !== null?
                  <Thumbnail large source={{uri:userdataserver.skype_profile_link}}  style={{backgroundColor:"gray"}}  />
                :userdataserver.facebook_profile_link !== null?
                  <Thumbnail large source={{uri:userdataserver.facebook_profile_link}} style={{backgroundColor:"gray"}}  />
                :userdataserver.spam_check<3?
                    <AVATAR width={wp(20)} height={wp(20)} />:
                userdataserver.spam_check<=5?<YELLOWPROFILE width={wp(20)} height={wp(20)} />:
                    <REDPROFILE  width={wp(20)} height={wp(20)} />
                }
                  
                  <View  style={db2styles.dataviewmain}>
                      <View style={db2styles.dataviewmaininner}>    
                          <Text  numberOfLines={2} style={{...db2styles.label,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}} >Name:{" "}
                          
                          <Text numberOfLines={2} style={{...db2styles.nametext,marginRight:userdataserver.real_name.length>12?70:70 ,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}}> 
                            {userdataserver.real_name?"Muhammad Zahid CEO of Zubi Apps and Game Techonly":"No Name Found"}
                            
                          </Text>  
                          </Text>
                              
                          <Text style={{...db2styles.callerapptext,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}}>{"     "}CallerApp</Text>  
                      </View>  

                      <View style={db2styles.dataviewmaininner}>    
                          <Text style={{...db2styles.label,fontFamily:fontmedium,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}} >
                            Reported Spam: 
                          </Text>
                          <Text numberOfLines={1} style={{...db2styles.nametext,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}}>
                            {" "}{userdataserver.spam_check} times
                          </Text> 
                      </View>

                      <View style={db2styles.dataviewmaininner}>    
                        <Image source={{uri:`https://zoobiapps.com/country_flags/${iso2.toLowerCase()}.png`}} 
                            style={db2styles.countryflag} />
                        <Text numberOfLines={1} style={{...db2styles.nametext,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}}>{countriesdetails.city !== ""?countriesdetails.city+' , ':countriesdetails.capital !== ""?countriesdetails.capital +", ":null}{countriesdetails.country}</Text>           
                      </View>
                      {countriesdetails.network !== ""?
                        <View style={db2styles.dataviewmaininner}>   
                          <Image source={{uri:`https://zoobiapps.com/number_finder/network_imgs/${countriesdetails.network.replace(/\s/g, '')}.png`}} 
                            style={db2styles.countryflag}  />
                          <Text numberOfLines={1} style={{...db2styles.nametext,color:userdataserver.spam_check<3?"#333333":userdataserver.spam_check<=5?"#333333":"#fff"}}>
                            {countriesdetails.network !== ""?countriesdetails.network + ' ,':null} {countriesdetails.country}
                          </Text>           
                        </View>
                      :null}
                  </View>
                </View>

                <View style={db2styles.buttonmaincontainer}>
                    <TouchableOpacity onPress={() => getskypephoto()} style={{...db2styles.getphotobutton, backgroundColor:userdataserver.spam_check<3?"#D1D9E6":userdataserver.spam_check<=5?"#fff":"#fff",}}>
                      <Text style={db2styles.getphotobuttontext}>Get photo</Text>
                    </TouchableOpacity>  
                  {isReported?
                    <TouchableOpacity style={{...db2styles.reportspambutton, flexDirection:"row", backgroundColor:buttonBgColor}}>
                        <AntDesign name="checkcircle" size={14} color={"#fff"} />
                        <Text style={{...db2styles.reportspambuttontext, marginLeft:10, color:"#fff"}}>Done</Text>
                    </TouchableOpacity> 
                  :
                    <TouchableOpacity onPress={() => report_spam()}  style={{...db2styles.reportspambutton,backgroundColor:userdataserver.spam_check<3?"#F94545":userdataserver.spam_check<=5?"#F94545":"#fff", }}>
                      <Text style={{...db2styles.reportspambuttontext, color:userdataserver.spam_check<3?"#fff":userdataserver.spam_check<=5?"#fff":"#F94545",}}>Report Spam</Text>
                    </TouchableOpacity> 

                  }
                 
                </View>  
            </Body>
        </CardItem>

        {suggested_name.length !== 1  ?
        <CardItem style={{...styles.suggestions_card}}  >
            <Body style={{padding:5,}}>
              <Text numberOfLines={1} style={[styles.nametext,styles.SuggestNameLabel]}>Suggested Names</Text> 
            </Body>
            {suggested_name.map((element,index) => {
              if(index>3){
                return null
              }
              if(element.suggested_name === userdataserver.real_name){
                return null;
              }
              return (
                
                  <CardItem key={index}  style={{marginBottom:2, borderRadius:5}}>
                    <Left>
                        <Text numberOfLines={1} style={styles.nametext}>{element.suggested_name}</Text> 
                    </Left>

                    <Right button style={{flexDirection:"row", backgroundColor:"transparent", justifyContent:"flex-end", paddingRight:0, marginRight:0}} >
                          <TouchableOpacity style={{marginRight:5,paddingHorizontal:10,}}>
                              <Text style={styles.showspambutton}>{element.number_names_suggestions_count === null ? 0:element.number_names_suggestions_count}</Text>      
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={{backgroundColor:appcolor, borderRadius:2, paddingHorizontal:10,paddingVertical:5 }} onPress={() => suggest_name_count_increment(element)}>
                            <Text style={{color:"#ffffff",fontSize:RFValue(13), fontFamily:fontmedium,}}>Suggest</Text>    
                          </TouchableOpacity>
                    </Right>
                </CardItem>
                
                )
                
              })}

        </CardItem>
      : <CardItem style={{...styles.suggestions_card}}  >
          <Body style={{padding:5,}}>
            <Text numberOfLines={1} style={[styles.nametext,{alignSelf:"center", marginVertical:10, backgroundColor:appcolor, color:"#fff", paddingHorizontal:20, paddingVertical:5, borderRadius:5}]}>Suggested Names</Text> 
          </Body>
          {suggested_name.map((element,index) => {
        
          return (
            
              <CardItem key={index}  style={{marginBottom:2}}>
                <Left>
                    <Text numberOfLines={1} style={styles.nametext}>{element.suggested_name}</Text> 
                </Left>
                <Right button style={{flexDirection:"row", backgroundColor:"transparent", justifyContent:"flex-end", paddingRight:0, marginRight:0}} >
                    
                      <TouchableOpacity style={{marginRight:10,}}>
                          <Text style={styles.showspambutton}>{element.number_names_suggestions_count === null ? 0:element.number_names_suggestions_count}</Text>      
                      </TouchableOpacity>
                    
                    <TouchableOpacity 
                    style={{backgroundColor:appcolor, borderRadius:2, paddingHorizontal:10,paddingVertical:5 }} onPress={() => suggest_name_count_increment(element)}>
                        <Text style={{color:"#ffffff",fontSize:RFValue(13), fontFamily:fontmedium,}}>Suggest</Text>    
                    </TouchableOpacity>
                </Right>
            </CardItem>
            
            )
            
          })}

        </CardItem> 
        }
      {isSuggestName?
      <CardItem style={{margin:15,alignItems:"center", justifyContent:"center", alignSelf:"center", borderRadius:5,backgroundColor:"#eee"}}>
        <Text style={{fontFamily:fontbold,textAlign:"center", color:appcolor}}>Thanks for your suggestions</Text>
      </CardItem>:
       <CardItem style={{backgroundColor:"#eee", flexDirection:"column", margin:5,borderRadius:5,}}>   
          <Text  style={{color:"#333333", alignSelf:"center", fontSize:RFValue(14), fontFamily:fontmedium}}>Suggest a Name</Text>
                <TextInput
                    label="Please enter name"
                    mode="outlined"
                    value={user_suggested_name}
                    contentContainerStyle={{backgroundColor:"green"}}
                    onChangeText={(text) => setUserSuggestedName(text)}
                    theme={{ colors: { primary: appcolor,text:appcolor,placeholder:deepgray, underlineColor:deepgray,}}}
                    style={{ 
                      maxWidth:wp(90),
                      minWidth:wp(90),  
                      alignSelf:"center", 
                      height:wp(12),
                      marginTop:wp(3),
                      fontFamily:fontfamily,
                     fontSize:RFValue(13)
                    }} 
                    returnKeyType = {'search'}
                    keyboardType="name-phone-pad"
                    returnKeyLabel={'search'}       
                  />
                <Grid> 
                <Row style={{ backgroundColor:"transparent", marginTop:10, width:wp(30),height:hp(6)}}>    
                    <Col style={{...modalstyles.smallcolumn,}}>
                        <TouchableOpacity onPress={() => {suggest_name_by_user()}}  style={{width:wp(30), backgroundColor:"transparent",alignItems:"center", justifyContent:"center", borderRadius:5, height:wp(10)}} >
                            <LinearGradient 
                              start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[buttonBgColor, buttonBgColor]} 
                              style={{width:wp(30), alignItems:"center", justifyContent:"center",  borderRadius:5, height:wp(10)}}>
                                <Text style={modalstyles.buttonText}>
                                    SUBMIT
                                </Text>
                            
                            </LinearGradient>
                        </TouchableOpacity>
                    </Col>
                </Row>
            </Grid>
            </CardItem>
    }
      </Content> 
      <View style={{width:wp(98), backgroundColor, marginBottom:1, alignSelf:"center"}}>
              <AdView type="image" media={false} />
            </View>
    </Container>
  )
}

export default SearchScreen;

const db2styles = StyleSheet.create({
  content:{
    flex:1
  },
  contentContainerStyle:{
    backgroundColor,
    flexGrow:1
  },
  bodyinnermainview:{
    flexDirection:"row", 
    width:wp(80)
  },
  skypeloadingview:{
    position:"absolute",
    zIndex:10,
    marginTop:0, 
    marginLeft:0,
    borderRadius:wp(20), 
    width:wp(20), 
    height:wp(20), 
    justifyContent:"center",
    alignItems:"center", 
    backgroundColor:"gray"
  },
  dataviewmain:{
    paddingLeft:10,
    width:wp(70),
    height:wp(25), 
    alignSelf:"center", 
    alignItems:"center",
    justifyContent:"center",
  },
  dataviewmaininner:{
    flexDirection:"row", 
    alignSelf:"flex-start", 
    justifyContent:"flex-start",
    width:wp(60),
    //alignItems:"center", 
    minHeight:wp(6), 
  },
  label:{
    fontFamily:fontmedium,
    fontSize:RFValue(15),
    color:"#333333", 
  },
  nametext:{     
    fontFamily:fontfamily, 
    fontSize: RFValue(15),
    color:"#333333"
  },
  callerapptext:{
   position:"absolute",
    fontFamily:fontbold, 
    right:-20,
    top:5,
    fontSize:RFValue(11), 
    color:appcolor
  },
  countryflag:{
    width:15, 
    height:15, 
    resizeMode:"center", 
    alignSelf:"center",
    marginRight:20,
  },
  buttonmaincontainer:{
    flexDirection:"row", 
    marginTop:10,
    justifyContent:"space-between", 
    width:wp(90)
  },
  getphotobutton:{                    
    backgroundColor:"#D1D9E6",
    justifyContent:"center", 
    marginTop:5,
    height:30,
    alignItems:"center", 
    paddingVertical:5,
    paddingHorizontal:10, 
    borderRadius:5, 
  },
  getphotobuttontext:{
    color:"#333333",
    fontSize:RFValue(12), 
    fontFamily:fontbold
  },
  reportspambutton:{
    backgroundColor:"#F94545", 
    margin:5, 
    alignItems:"center", 
    justifyContent:"center",
    height:30,
    paddingHorizontal:10, 
    borderRadius:5,  
  },
  reportspambuttontext:{
    color:"#fff",
    fontSize:RFValue(12), 
    fontWeight:"bold"
  },
  suggest_a_name:{
    color:"#333333", 
    alignSelf:"center", 
    fontSize:RFValue(14),
    marginTop:20, 
    fontFamily:fontmedium
  },
  textinput:{ 
    maxWidth:wp(90),
    minWidth:wp(90),  
    alignSelf:"center", 
    height:wp(12),
    marginTop:wp(3),
    fontSize:RFValue(15),
    fontFamily:fontfamily,
   
  },
  suggest_name_submitbuton:{
    width:wp(30), 
    backgroundColor:buttonBgColor, 
    alignItems:"center", 
    justifyContent:"center", 
    borderRadius:5, 
    height:wp(10)
  },
  adview:{
    width:wp(98), 
    backgroundColor, 
    marginBottom:1, 
    alignSelf:"center"
  }
})

const appuserstyles = StyleSheet.create({
  bgimage:{ 
    position:"absolute",
    top:-hp(15),
    minWidth: wp(100),
    height:hp(51),
    backgroundColor:"transparent",
    width:wp(100),  
    tintColor:buttonBgColor,
    aspectRatio:.4
  },
  image:{ 
   
    borderColor:"green",
   
    backgroundColor:lightgray, 
    borderRadius:wp(40), 
    alignSelf:"center", 
    height:wp(40),
    width:wp(40),
    overflow:"hidden",
    justifyContent:"center",
    alignItems:"center"
   
  },
  image2:{ 
    resizeMode:"cover",
    height:wp(40),
    width:wp(40),
   
  },
  datacard:{
    width:wp(80),
 
    borderRadius:5, 
    flexDirection:"column",
    backgroundColor:"#ECF0F3",
    alignItems:"flex-start", 
    alignSelf:"center", 
    marginTop:wp(2)
  },
  text:{
    color:"rgba(0,0,0,.7)",
  
    fontSize:RFValue(17),
    lineHeight:RFValue(17)*1.4, 
    fontFamily:fontbold
  },
  
})

const modalstyles = StyleSheet.create({
  mainView:{
        //flexGrow: 1, 
        //...StyleSheet.absoluteFillObject,
        backgroundColor:"rgba(237, 237, 237,0)", 
        
        //backgroundColor:"red",
        borderRadius:wp(4), 
        borderWidth:0, 
        
        borderColor:buttonBgColor
  },
  innerView:{
      //...StyleSheet.absoluteFillObject,
      margin:2,  
      borderRadius:wp(4),  
      overflow:"hidden",
      backgroundColor:"#ffffff"
  },
  maincolumn:{ 
      backgroundColor: '#ffffff', 
      padding:10, 
  },
  smallcolumn:{ 
      backgroundColor:'transparent', 
      justifyContent:"center", 
      alignItems:"center",
     
  },
  title:{
      fontSize:RFValue(14),
      color:"rgba(0,0,0,.6)",  
      fontFamily:fontblack
  },
  subtitle:{
      fontSize:RFValue(14),
      textAlign:"justify", 
      color:"rgba(0,0,0,.6)",
      lineHeight:RFValue(14)*1.2,
      marginTop:2, 
      fontFamily:fontmedium
  },
  buttonText: {
      fontSize: RFValue(16),
      fontFamily:fontmedium,
      textAlign: 'center',
      color: '#ffffff',
      backgroundColor: 'transparent',
  },
  
})


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff"
  },
  SuggestNameLabel:{
    alignSelf:"center", 
    marginVertical:10, 
   
    color:"rgba(0,0,0,.8)", 
    fontSize:18,
    paddingHorizontal:20, 
    paddingVertical:5, 
    borderRadius:5
  },
  header:{
    backgroundColor,
    height:56, 
    paddingLeft:0, 
    borderRadius:0,
  },
  maincard:{
    marginLeft:5,
    marginTop:5,
    marginRight:5,
    backgroundColor:"#fff",
    borderRadius:5,
    paddingHorizontal:10,
    height:170,
    justifyContent:"center",
    justifyContent:"center",
  },
  suggestions_card:{
  
    paddingTop:0,
    borderRadius:5,
    alignContent:"center", 
    flexDirection:"column", 
    backgroundColor:"#ECF0F3",
    marginLeft:5,
    marginTop:5,
    marginRight:5,
    marginBottom:5,
  },
  menu:{ 
    zIndex: 2, 
    color:appcolor, 
    fontSize:30,
    backgroundColor, 
    paddingVertical:2, 
    paddingRight:10, 
    borderTopRightRadius:30, 
    borderBottomRightRadius:30,
    shadowColor: backgroundColor,
    shadowOffset: {
    width: 0,
    height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 16.00,
    elevation: 6,
  },
  profile_icon:{
    backgroundColor,
    width:40, 
    height:40, 
    borderRadius:20,
    alignItems:"center",
    justifyContent:"center",
    shadowColor: backgroundColor,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 1,
    shadowRadius: 16.00,
    elevation: 6,
  },
  search_bar:{
      borderWidth:0,  
      shadowColor: backgroundColor,
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 1,
      shadowRadius: 16.00,
      elevation: 6, 
  },
  nametext:{
   
    color:"#333333",
   
    fontFamily:fontbold,
    fontSize:RFValue(14)
  },
  emailtext:{
    fontSize:RFValue(12)
  },
  showspambutton:{
   fontWeight:"bold",
    backgroundColor:appcolor, 
    borderColor:appcolor, 
    borderWidth:0,
    borderRadius:2, 
    textAlign:"center", 
    textAlignVertical:"center", 
    paddingVertical:3.5, 
    paddingHorizontal:8, 
    justifyContent:"center", 
    color:"#fff",
    alignItems:"center", 
    textAlign:"left", 
    fontSize:RFValue(14)
  },
  showidbutton:{
   fontWeight:"bold",
    backgroundColor:"red", 
    marginTop:normalize(15),
    borderColor:'red', 
    borderWidth:1,
    borderRadius:5, 
    alignSelf:"center",
    textAlignVertical:"center", 
    paddingVertical:5, 
    paddingHorizontal:10, 
    justifyContent:"center", 
    color:"#fff",
    alignItems:"center", 
    textAlign:"center", 
    fontSize:normalize(12)
  },
  submitbutton:{
    fontWeight:"bold",
    backgroundColor:appcolor, 
    marginVertical:10,
    borderRadius:5, 
    textAlign:"center", 
    alignSelf:"center",
    textAlignVertical:"center", 
    paddingVertical:10, 
    paddingHorizontal:30, 
    justifyContent:"center", 
    color:"#fff",
    alignItems:"center", 
    textAlign:"left", 
    fontSize:RFValue(14)
  },
  defaulttext:{
    fontSize:RFValue(14),
    fontFamily:fontmedium,
    textAlign:"center",
    color, 
  },
  button:{
      width: wp(50),
      marginHorizontal:wp(24),
      height: wp(10),
      top:wp(5),
      justifyContent: 'center',
    // bottom:wp(15),
    // position:"absolute",
      alignItems: 'center',
      borderRadius:5,
    
      backgroundColor:buttonBgColor,
  },
});
