export const trackerData = {
  Food: {
    Liquids: {
      options: ["Water","Coffee","Soda","Milk",{ label: "Other", input: "text" }]
    },
    Snacks: {
      options: ["Biscuits","Chocolate","Chips",{ label: "Other", input: "text" }]
    },
    Breakfast: {
      options: ["Toast","Weetbix","Cereal","Takeout",{ label: "Other", input: "text" }],
      next: {
        Takeout: {
          options: ["McDonalds","Burger King","Chinese","Pizza",{ label: "Other", input: "text" }]
        }
      }
    },
    Lunch: {
      options: ["Toast","Sandwich","Protein","Takeout",{ label: "Other", input: "text" }],
      next: {
        Takeout: {
          options: ["McDonalds","Burger King","Chinese","Pizza",{ label: "Other", input: "text" }]
        }
      }
    },
    Dinner: {
      options: ["Steak","Chicken","Veg","Salad","Takeout",{ label: "Other", input: "text" }],
      next: {
        Takeout: {
          options: ["McDonalds","Burger King","Chinese","Pizza",{ label: "Other", input: "text" }]
        }
      }
    }
  },

  Sleep: {
    Nap: {
      Duration: {
        options: ["1h","2h","3h","4h",{ label: "Other", input: "text" }],
        next: {
          HadDream: {
            options: ["None","Normal","Real",{ label: "Other", input: "text" }],
            next: {
              None: {},
              Normal: {
                DreamType: {
                  options: ["Normal","Scary","Death",{ label: "Other", input: "text" }],
                  next: {
                    Amount: {
                      options: ["One","A Few","A Lot",{ label: "Other", input: "text" }]
                    }
                  }
                }
              },
              Real: {
                DreamType: {
                  options: ["Normal","Scary","Death",{ label: "Other", input: "text" }],
                  next: {
                    Amount: {
                      options: ["One","A Few","A Lot",{ label: "Other", input: "text" }]
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    LastNight: {
      Duration: {
        options: ["1h","2h","3h","4h","5h","6h","7h","8h","9h","10h",{ label: "Other", input: "text" }],
        next: {
          HadDream: {
            options: ["None","Normal","Real",{ label: "Other", input: "text" }],
            next: {
              None: {},
              Normal: {
                DreamType: {
                  options: ["Normal","Scary","Death",{ label: "Other", input: "text" }],
                  next: {
                    Amount: {
                      options: ["One","A Few","A Lot",{ label: "Other", input: "text" }]
                    }
                  }
                }
              },
              Real: {
                DreamType: {
                  options: ["Normal","Scary","Death",{ label: "Other", input: "text" }],
                  next: {
                    Amount: {
                      options: ["One","A Few","A Lot",{ label: "Other", input: "text" }]
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  Mood: {
    options: ["Joyful","Content","Neutral","Irritable","Low",{ label: "Other", input: "text" }]
  },

  Energy: {
    options: ["Very High","High","Medium","Low","Very Low","None",{ label: "Other", input: "text" }]
  },

  Activity: {
    options: ["None","Walk","Run","Gym","Sports","Yoga",{ label: "Other", input: "text" }]
  },

  Symptoms: {
    options: ["Headache","Stomachache","Fever","Cough","Fatigue","Blindness",{ label: "Other", input: "text" }]
  },

  HeartHealth: {
    HeartRate: { options: ["Low","Normal","High",{ label: "Other", input: "text" }] },
    BloodPressure: { options: ["Low","Normal","High",{ label: "Other", input: "text" }] },
    ChestPain: { options: ["None","Mild","Severe",{ label: "Other", input: "text" }] },
    Palpitations: { options: ["One","A Few","Too Many",{ label: "Other", input: "text" }] }
  },

  Intimacy: {
    options: ["Yes","No",{ label: "Other", input: "text" }]
  }
};
