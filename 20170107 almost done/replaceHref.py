import argparse
def replacehref(html, href, ui_sref):
    # print html, href, ui_sref

    # href = "href=\"/english/" + href + "\"" # ex immigrate/skilled/apply-who-express.asp
    dic = {
        'Home' : "ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Home\', numOfPara: 8})\"",
        'Become_a_candidate' : "ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Become_a_candidate\', numOfPara: 3})\"",
        'Who_can_apply': "ui-sref=\"fourParameters({category:\'ExpressEntry\', para1:\'Become_a_candidate\', para2:\'Who_can_apply\', numOfPara: 6})\"",
        'Submit_your_profile' : ,
        'How_the_pool_works': ,
        'Understand_the_ranking_system': ,
        'Rounds_of_invitations' : ,
        'Invitations_to_apply' : ,
        'After_you_apply' : ,
        'Prepare_for_your_arrival' : ,
        'Federal_skilled_workers' : "ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Federal_skilled_workers\', numOfPara: 8})\"",
        'Federal_skilled_trades' : "ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Federal_skilled_trades\', numOfPara: 13})\"",
        'Canadian_experience_class' : "ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Canadian_experience_class\', numOfPara: 10})\""

    }
    # lists = [[ "href=\"/english/immigrate/skilled/candidate.asp\"" ,"ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Become_a_candidate\', numOfPara: 3})\""],
    # ["href=\"/english/immigrate/skilled/apply-who.asp\"", "ui-sref=\"threeParameters({category:\'ExpressEntry\', para1:\'Federal_skilled_workers\', numOfPara: 8})\""]
    # ];

    print html, href, dic[ui_sref]
    # f1 = open(html, 'r')
    # f2 = open(html+'ui_sref.html', 'w')
    #
    #
    #
    # for line in f1:
    #     f2.write(line.replace(href, ui_sref))
    # f1.close()
    # f2.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('html_file', help='put html file in it')
    parser.add_argument('href', help='href link')
    parser.add_argument('ui_sref')
    args = parser.parse_args()
    replacehref(args.html_file, args.href, args.ui_sref)
