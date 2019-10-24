import React, {Component} from 'react';
import { Platform, StyleSheet, Text,FlatList, Image, ListView, ActivityIndicator, View, ScrollView, TouchableOpacity,TouchableHighlight } from 'react-native';
import { createStackNavigator, createAppNavigator, createAppContainer } from 'react-navigation';                                                       
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import { DotIndicator } from 'react-native-indicators';
import { YourridesStyles } from '../StyleSheet/Styles';
import { API } from '../Server/Server';
import { NavigationActions } from 'react-navigation';
import Snackbar from 'react-native-snackbar';
class ListItem extends React.Component {
  //render all the ui components
    render() {
      const { item} = this.props;
      let button;
      if(item.status=='1'){
        button=  <TouchableHighlight style={{height:20,width:50,backgroundColor:'green',borderRadius:10,alignContent:'center',alignItems:'center'}}
        onPress={()=> this.props.navigation.navigate('RazorPay',
       {
         orderid:item.orderId,
         price:item.totalSum,
         personsCount:item.personsCount
        }
        )}>
        <Text style={{color:'white'}}>Pay</Text>
      </TouchableHighlight>
      }else{
       button=null;
      }
      return (
        <View style={YourridesStyles.container}>
          <View style={YourridesStyles.signup}>
            <View style={[YourridesStyles.buttonContainer, YourridesStyles.signupButton]} >
              <View style={YourridesStyles.box}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={YourridesStyles.signUpText0} >Date:</Text>
                  <Text style={YourridesStyles.signUpText1} >{item.date}</Text>
                </View>
                <Text style={YourridesStyles.signUpText2} > Rs.{item.totalSum}</Text>
              </View>
              <View style={{ flexDirection: 'row', paddingRight: 25, }}>
                <Text style={YourridesStyles.signUpText4} >Items:</Text>
                <Text style={YourridesStyles.signUpText3} >{item.recipeNames}</Text>
              </View>
              <View style={{ flexDirection: 'row', paddingRight: 25, }}>
                <Text style={YourridesStyles.signUpText4} >Status:</Text>
                <Text style={YourridesStyles.signUpText3} >
                  {item.status === '0' ? "Your Order is Pending" : item.status === '1' ? "Your order is accepted" : item.status === '2' ? "completed" : "nothing"}
                </Text>
                {/* <TouchableOpacity style={{height:20,width:50,backgroundColor:'green',borderRadius:10,alignContent:'center',alignItems:'center'}}>
                  <Text style={{color:'white'}}>Pay</Text>
                </TouchableOpacity> */}
                {button}
              </View>
            </View>
          </View>
  
        </View>
  
  
      )
    }
  }


export default class YourRides extends Component {

  static navigationOptions =
    {
      title: 'My Orders',
    };
    //set state variables and declare all the state values 
  constructor(props) {

    super(props);
    this.state = {
      isLoading: true,
      dataSource: [],
      isFetching: false,


    }
  }
//lifecycle method
  componentDidMount()
    {
        this.myOrders()
    }

    //swipe refresh the data from database about all the history order
  onRefresh() {
    this.setState({ isFetching: true }, function() { this.myOrders() });
 }

 //lifecycle methods to recall the method
componentWillReceiveProps(nextProps) {
  console.log(nextProps);
  console.log("re loading...........")
  this.myOrders();
}

//this method is used to fetch the data from database to get all the order history 
  myOrders() {
    console.log("loading in history");
    AsyncStorage.getItem('userId', (err, result) => {
      NetInfo.fetch().then(state => {
        console.log("Connection type", state.type);
        console.log(state);
        console.log("Is connected?", state.isConnected);
        if (state.type=="none") {
          console.log(state.type);
          Snackbar.show({
            title: 'No Internet Connection',
            backgroundColor: 'red',
            duration: Snackbar.LENGTH_LONG,
          });
        }
        else{
      return fetch( API + "OrderHistory.php",
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            result: result,
          })
        })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("responseJson"+responseJson.totalSum+"count"+responseJson.personsCount);
          this.setState({
            isLoading: false,
            dataSource: responseJson,
            isFetching: false
          }, function () {
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
    });
    });
  }

  //flatlist item separator 
  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          width: "100%",
          backgroundColor: "#000",
        }}
      />
    );
  }

  //dispaly all image when no item in flat list 
  _listEmptyComponent = () => {
    return (
      <View>
        <Text></Text>
        <Image
          style={YourridesStyles.imageurl}
          source={{ uri: 'https://cdn.dribbble.com/users/2370289/screenshots/6150406/no_items_found.jpg' }} />

      </View>
    )
  }

  //render all the ui components
  render() {

    if (this.state.isLoading) {
      return (
        <View style={YourridesStyles.load}>
          <DotIndicator color='#ed7070' />
        </View>
      );
    }

    const { dataSource } = this.state;
    const { goBack } = this.props.navigation;
    return (

      <View style={YourridesStyles.Container}>

        <View style={YourridesStyles.end1}>
          <View >
            <TouchableOpacity onPress={() => goBack(null)} >

              <Text style={YourridesStyles.back}> ﹤</Text>
            </TouchableOpacity>
          </View>

          <View style={YourridesStyles.end}>
            <View style={[YourridesStyles.button, YourridesStyles.s]}>
              <Text style={YourridesStyles.signUpText}>My Orders</Text>
            </View>
          </View>
        </View>
        <ScrollView style={YourridesStyles.scroll}>
          <View>

            <FlatList

              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}

              data={this.state.dataSource}

              onRefresh={() => this.onRefresh()}
              refreshing={this.state.isFetching}

              ItemSeparatorComponent={this.FlatListItemSeparator}
              renderItem={({ item, index }) =>
                <View style={YourridesStyles.FlatList} >
                  <ListItem navigation={this.props.navigation}
                    item={item}
                  />
                </View>
              }
              keyExtractor={item => item.id}
              ListEmptyComponent={this._listEmptyComponent}
            />
          </View>
        </ScrollView>

      </View>
    );
  }
}
